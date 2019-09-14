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

function getAllRepositories(root, resultCallback) {
  fs.readdir(root, (err, files) => {
    async.filter(files, (file, truthCallback) => {
      fs.stat(path.resolve(root, file), (err, stat) => {
        truthCallback(null, stat.isDirectory());
      });
    }, (err, folders) => {
      async.filter(folders, (folder, truthCallback) => {
        execFile('git', ['-C', path.resolve(root, folder), 'rev-parse', '--git-dir'], (err, out) => {
          truthCallback(null, !err);
        });
      }, (err, repos) => {
        resultCallback(repos);
      });
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