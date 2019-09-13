const fs = require('fs');

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

  return rootDir;
}

function main() {
  const rootDir = getRootDir();
  if (!rootDir) {
    return;
  }
}

main();