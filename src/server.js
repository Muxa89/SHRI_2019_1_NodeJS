const fs = require('fs');
const path = require('path');
const { execFile } = require('child_process');

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
    console.error('Provide correct path.')
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
    async.filter(files, (file, truthCallback) => {
      fs.stat(path.resolve(root, file), (err, stat) => {
        truthCallback(null, stat.isDirectory());
      });
    }, (err, folders) => {
      async.filter(folders, (folder, truthCallback) => {
        getGitDir(path.resolve(root, folder), (err, out) => {
          truthCallback(null, !err);
        })
      }, (err, repos) => {
        resultCallback(repos);
      });
    });
  });
}

function getCommitList(folder, hash, callback) {
  getGitDir(folder, (err, gitFolder) => {
    execFile('git', ['--no-pager', '--git-dir', path.resolve(folder, gitFolder), 'log', '--pretty=format:%H%n%ai%n%s%n', hash], (err, out) => {
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
    execFile('git', ['--git-dir', path.resolve(folder, gitFolder), 'show', hash], (err, out) => {
      callback(err, out);
    });
  });
}

function getRepositoryContent(folder, hash, dirPath, callback) {
  getGitDir(folder, (err, gitFolder) => {
    execFile('git', ['--git-dir', path.resolve(folder, gitFolder), 'show', (hash || 'master') + ':' + (dirPath || '')], (err, out) => {
      const lines = out.split('\n');
      lines.splice(0, 2);
      lines.splice(lines.length - 1, 1);
      const files = lines.sort((a, b) => {
        if (a.indexOf('/') !== -1 && b.indexOf('/') === -1) {
          return -1;
        } else if (a.indexOf('/') === -1 && b.indexOf('/') !== -1) {
          return 1;
        } else {
          return (a < b) ? -1 : 1;
        }
      });
      callback(err, files);
    });
  });
}

function treeHandler(root) {
  return (req, res) => {
    getRepositoryContent(path.resolve(root, req.params.repositoryId), req.params.commitHash, req.params.path, (err, files) => {
      res.json(files);
    });
  };
}

function startServer(root) {
  const app = express();

  app.get('/api/repos', (req, res) => {
    getAllRepositories(root, (repos) => {
      res.json(repos);
    })
  });

  app.get('/api/repos/:repositoryId/commits/:commitHash', (req, res) => {
    getCommitList(path.resolve(root, req.params.repositoryId), req.params.commitHash, (err, commits) => {
      res.json(commits);
    });
  });

  app.get('/api/repos/:repositoryId/commits/:commitHash/diff', (req, res) => {
    getCommitDiff(path.resolve(root, req.params.repositoryId), req.params.commitHash, (err, diff) => {
      res.json({ diff });
    });
  });

  app.get('/api/repos/:repositoryId', treeHandler(root));
  app.get('/api/repos/:repositoryId/tree/:commitHash', treeHandler(root));
  app.get('/api/repos/:repositoryId/tree/:commitHash/:path([a-zA-Z0-9_\\-/]+)', treeHandler(root));

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