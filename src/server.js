const fs = require('fs');

function getRepoDir() {
  const repoDir = process.argv[2];

  if (!repoDir) {
    console.error('Repository path not specified.');
    console.error('Usage: node server.js <repository-path>');
    return false;
  } else if (!fs.existsSync(repoDir)) {
    console.error('Specified repository path not exists on file system.');
    console.error('Provide correct path.')
    return false;
  }

  return repoDir;
}

function main() {
  const repoDir = getRepoDir();
  if (!repoDir) {
    return;
  }
}

main();