const express = require('express');
const { resolve } = require('path');
const sassMiddleware = require('node-sass-middleware');

const UI_SRC_DIR = './src/ui';
const TEMPLATES_DIR = 'templates';
const SASS_DIR = 'sass';
const IMAGES_DIR = 'images';
const CSS_DIR = 'dist/css';
const LIB_DIR = 'lib';

const app = express();

app.use(sassMiddleware({
  src: resolve(UI_SRC_DIR, SASS_DIR),
  dest: resolve(CSS_DIR),
  outputStyle: 'compressed',
  indentedSyntax: true,
  prefix: '/css'
}));

app.use('/img', express.static(resolve(UI_SRC_DIR, IMAGES_DIR)));
app.use('/css', express.static(resolve(CSS_DIR)));
app.use('/lib', express.static(resolve(LIB_DIR)));

app.set('view engine', 'pug');
app.get('/1440/1.1', (req, res) => res.render(resolve(UI_SRC_DIR, TEMPLATES_DIR, './1440/1.1.pug'), {
  breadcrumbsList: ['arcadia'],
  item: 'arcadia',
  branch: 'trunk',
  lastCommit: {
    hash: 'c4d248',
    date: '20 Oct 2017, 12:24',
    commiter: 'robot-srch-releaser' 
  },
  viewSelectorList: [{ name: 'FILES', selected: true }, { name: 'BRANCHES', selected: false }],
  infoTableData: [
    { name: "api", type: "folder", commit: "d53dsv", message: "[vcs] move http to arc", commiter: "noxoomo", date: "4 s ago" },
    { name: "ci", type: "folder", commit: "c53dsv", message: "[vcs] test for empty commit message", commiter: "nikitxskv", date: "1 min ago" },
    { name: "contrib", type: "folder", commit: "s53dsv", message: "[vcs] change owner to g:arc", commiter: "nalpp", date: "16:25" },
    { name: "http", type: "folder", commit: "h5jdsv", message: "[vcs] move http to arc", commiter: "somov", date: "Yesterday, 14:50" },
    { name: "lib", type: "folder", commit: "f5jdsv", message: "ARCADIA-771: append /trunk/arcadia/", commiter: "deshevoy", date: "Jan 11, 12:01" },
    { name: "local", type: "folder", commit: "k5jdsv", message: "ARCADIA:771: detect binary files", commiter: "exprmntr", date: "Jan 10, 12:01" },
    { name: "packages", type: "folder", commit: "a5jdsv", message: "[vcs] VCS-803: packages for services", commiter: "levanov", date: "Jan 1, 12:01" },
    { name: "robots", type: "folder", commit: "l5jdsv", message: "ARCADIA-771: convert string to json object", commiter: "torkve", date: "Dec 29, 2017" },
    { name: "server", type: "folder", commit: "j5jdsv", message: "[vcs] get list of refs", commiter: "spreis", date: "Dec 29, 2017" },
    { name: "ut", type: "folder", commit: "5jdsvk", message: "[vsc] store merge conflicts", commiter: "annaveronika", date: "Dec 29, 2017" },
    { name: "README.md", type: "file", commit: "h5jdsl", message: "[vcs] add readme", commiter: "pg", date: "Dec 29, 2017" },
    { name: "ya.make", type: "file", commit: "k5jdsv", message: "[vcs] move http to arc", commiter: "mvel", date: "Dec 29, 2017" }
  ]
}));

app.get('/1440/1.5', (req, res) => res.render(resolve(UI_SRC_DIR, TEMPLATES_DIR, './1440/1.5.pug'), {
  breadcrumbsList: ['root', 'trunk', 'arcadia', 'addapter', 'ya.make'],
  item: 'ya.make',
  branch: 'trunk',
  lastCommit: {
    hash: 'r3248813',
    date: '20 Oct 2017, 12:24',
    commiter: 'robot-srch-releaser' 
  },
  viewSelectorList: [{ name: 'DETAILS', selected: true }, { name: 'HISTORY', selected: false }],
}));

app.listen(8000);