const fs = require('fs');
const path = require('path');
const { execFile } = require('child_process');
const rimraf = require('rimraf');
const cors = require('cors');

const async = require('async');

const express = require('express');

function getRootDir() {
  const rootDir = process.argv[2];

  if (!rootDir) {
    console.error('Repository root path not specified.');
    console.error('Usage: node server.js <repository-path>');
    return false;
  } else if (!fs.existsSync(rootDir)) {
    console.error('Specified repository root path not exists on file system.');
    console.error('Provide correct path.');
    return false;
  }

  return path.resolve(rootDir);
}

function getGitDir(folder, callback) {
  execFile('git', ['-C', folder, 'rev-parse', '--git-dir'], (err, out) => {
    callback(err, out.replace(/^\s|\s$/g, ''));
  });
}

function getAllRepositories(root, resultCallback) {
  fs.readdir(root, (err, files) => {
    async.filter(
      files,
      (file, truthCallback) => {
        fs.stat(path.resolve(root, file), (err, stat) => {
          truthCallback(null, stat.isDirectory());
        });
      },
      (err, folders) => {
        async.filter(
          folders,
          (folder, truthCallback) => {
            getGitDir(path.resolve(root, folder), (err, out) => {
              truthCallback(null, !err);
            });
          },
          (err, repos) => {
            resultCallback(repos);
          }
        );
      }
    );
  });
}

function getCommitList(folder, hash, callback) {
  getCommitListWithPaging(folder, hash, undefined, undefined, callback);
}

function getCommitListWithPaging(folder, hash, start, limit, callback) {
  getGitDir(folder, (err, gitFolder) => {
    const params = [
      '--no-pager',
      '--git-dir',
      path.resolve(folder, gitFolder),
      'log',
      '--pretty=format:%H%n%ai%n%s%n',
      hash
    ];
    if (start && limit) {
      params.push('--skip', start, '-n', limit);
    }

    execFile('git', params, (err, out) => {
      const lines = out.split('\n');
      const res = [];
      while (lines.length > 0) {
        const [hash, creationDate, subject, newline] = lines.splice(0, 4);
        res.push({ hash, creationDate, subject });
      }
      callback(null, res);
    });
  });
}

function getCommitDiff(folder, hash, callback) {
  getGitDir(folder, (err, gitFolder) => {
    execFile(
      'git',
      ['--git-dir', path.resolve(folder, gitFolder), 'show', hash],
      (err, out) => {
        callback(err, out);
      }
    );
  });
}

function getRepositoryContent(folder, hash, dirPath, callback) {
  getGitDir(folder, (err, gitFolder) => {
    execFile(
      'git',
      [
        '--git-dir',
        path.resolve(folder, gitFolder),
        'show',
        (hash || 'master') + ':' + (dirPath || '')
      ],
      (err, out) => {
        const lines = out.split('\n');
        lines.splice(0, 2);
        lines.splice(lines.length - 1, 1);
        const files = lines.sort((a, b) => {
          if (a.indexOf('/') !== -1 && b.indexOf('/') === -1) {
            return -1;
          } else if (a.indexOf('/') === -1 && b.indexOf('/') !== -1) {
            return 1;
          } else {
            return a < b ? -1 : 1;
          }
        });
        callback(err, files);
      }
    );
  });
}

function getBlobContent(folder, hash, blobPath, callback) {
  getGitDir(folder, (err, gitFolder) => {
    execFile(
      'git',
      [
        '--git-dir',
        path.resolve(folder, gitFolder),
        'show',
        hash + ':' + blobPath
      ],
      (err, out) => {
        callback(out);
      }
    );
  });
}

function deleteRepository(folder, callback) {
  rimraf(folder, err => {
    callback(err);
  });
}

function downloadNewRepository(root, url, callback) {
  const urlParts = url.split('/');
  const repoName = urlParts[urlParts.length - 1].replace(/\.git/g, '');
  execFile('git', ['clone', url, path.resolve(root, repoName)], err => {
    callback(err);
  });
}

function walkDir(dir, fn, finishFn) {
  async.each(
    fs.readdirSync(dir),
    (f, callback) => {
      let dirPath = path.join(dir, f);
      let isDirectory = fs.statSync(dirPath).isDirectory();
      if (isDirectory) {
        walkDir(dirPath, fn, () => {
          callback();
        });
      } else {
        fn(dirPath, callback);
      }
    },
    err => {
      finishFn();
    }
  );
}

function getCount(folder, resultCallback) {
  let sum = 0;

  //TODO not count blob files
  walkDir(
    folder,
    (file, cb) => {
      fs.createReadStream(file)
        .on('data', chunk => {
          sum += chunk.length;
        })
        .on('end', () => {
          cb();
        });
    },
    () => {
      resultCallback(sum);
    }
  );
}

function treeHandler(root) {
  return (req, res) => {
    getRepositoryContent(
      path.resolve(root, req.params.repositoryId),
      req.params.commitHash,
      req.params.path,
      (err, files) => {
        res.json(files);
      }
    );
  };
}

function startServer(root) {
  const app = express();
  app.use(express.json());
  app.use(cors());

  app.get('/api/repos', (req, res) => {
    getAllRepositories(root, repos => {
      res.json(repos);
    });
  });

  app.get('/api/repos/:repositoryId/commits/:commitHash', (req, res) => {
    getCommitList(
      path.resolve(root, req.params.repositoryId),
      req.params.commitHash,
      (err, commits) => {
        res.json(commits);
      }
    );
  });

  app.get(
    '/api/repos/:repositoryId/commits/:commitHash/page/start/:start/limit/:limit',
    (req, res) => {
      getCommitListWithPaging(
        path.resolve(root, req.params.repositoryId),
        req.params.commitHash,
        req.params.start,
        req.params.limit,
        (err, commits) => {
          res.json(commits);
        }
      );
    }
  );

  app.get('/api/repos/:repositoryId/commits/:commitHash/diff', (req, res) => {
    getCommitDiff(
      path.resolve(root, req.params.repositoryId),
      req.params.commitHash,
      (err, diff) => {
        res.json({ diff });
      }
    );
  });

  app.get('/api/repos/:repositoryId', treeHandler(root));
  app.get('/api/repos/:repositoryId/tree/:commitHash', treeHandler(root));
  app.get(
    '/api/repos/:repositoryId/tree/:commitHash/:path([a-zA-Z0-9_\\-/]+)',
    treeHandler(root)
  );

  app.get(
    '/api/repos/:repositoryId/blob/:commitHash/:pathToFile([a-zA-Z0-9_\\-/.]+)',
    (req, res) => {
      getBlobContent(
        path.resolve(root, req.params.repositoryId),
        req.params.commitHash,
        req.params.pathToFile,
        content => {
          res.json({ content });
        }
      );
    }
  );

  app.delete('/api/repos/:repositoryId', (req, res) => {
    deleteRepository(
      path.resolve(root, req.params.repositoryId),
      (err, stats) => {
        if (err) {
          res.json({
            status: 'ERR',
            message:
              err.errno === -4058
                ? 'Repository not found'
                : 'Error occured during request'
          });
          return;
        }

        res.json({
          status: 'OK'
        });
      }
    );
  });

  app.post('/api/repos', (req, res) => {
    const { url } = req.body;
    downloadNewRepository(root, url, err => {
      res.json({
        status: err ? 'ERR' : 'OK'
      });
    });
  });

  app.get('/api/repos/:repositoryId/count', (req, res) => {
    getCount(path.resolve(root, req.params.repositoryId), sum => {
      res.json({
        symbolCount: sum
      });
    });
  });

  const port = 3000;
  app.listen(port);
  console.log('Server is listening on ' + port);
}

function main() {
  const rootDir = getRootDir();
  if (!rootDir) {
    return;
  }

  console.log('Serving files from: ' + rootDir);

  startServer(rootDir);
}

main();
