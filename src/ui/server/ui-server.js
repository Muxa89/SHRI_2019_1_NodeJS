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

app.get('/1440/1.1', (req, res) => res.render(resolve(UI_SRC_DIR, TEMPLATES_DIR, './1440/1.1.pug'), require('./data/1440/1.1.js')));
app.get('/1440/1.5', (req, res) => res.render(resolve(UI_SRC_DIR, TEMPLATES_DIR, './1440/1.5.pug'), require('./data/1440/1.5.js')));
app.get('/1440/1.6', (req, res) => res.render(resolve(UI_SRC_DIR, TEMPLATES_DIR, './1440/1.6.pug'), require('./data/1440/1.6.js')));

app.listen(8000);