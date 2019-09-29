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

app.use(
  sassMiddleware({
    src: resolve(UI_SRC_DIR, SASS_DIR),
    dest: resolve(CSS_DIR),
    outputStyle: 'compressed',
    indentedSyntax: true,
    prefix: '/css'
  })
);

app.use('/img', express.static(resolve(UI_SRC_DIR, IMAGES_DIR)));
app.use('/css', express.static(resolve(CSS_DIR)));
app.use('/lib', express.static(resolve(LIB_DIR)));

app.set('view engine', 'pug');

function servePage(address) {
  app.get(`/${address}`, (req, res) =>
    res.render(
      resolve(UI_SRC_DIR, TEMPLATES_DIR, `./pages/${address}.pug`),
      require(`./data/${address}.js`)
    )
  );
}

const pages = [
  '1440/1.1',
  '1440/1.5',
  '1440/1.6',
  '1440/2.1',
  '1440/3.1',
  '360/1.1',
  '360/1.5',
  '360/1.6',
  '360/2.1',
  '360/3.1'
];

pages.forEach(servePage);

const port = 8000;
app.listen(port);

console.log(`Server is listening on ${port}...`);
