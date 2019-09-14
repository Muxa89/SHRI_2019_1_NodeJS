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