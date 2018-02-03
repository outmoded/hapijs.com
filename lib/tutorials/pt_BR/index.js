'use strict';

const Fs = require('fs');
const Path = require('path');

exports.auth = {
    title: 'Autenticação',
    contents: Fs.readFileSync(Path.join(__dirname, 'auth.md'), 'utf8')
};


exports.caching = {
    title: 'Caching',
    contents: Fs.readFileSync(Path.join(__dirname, 'caching.md'), 'utf8')
};


exports.cookies = {
    title: 'Cookies',
    contents: Fs.readFileSync(Path.join(__dirname, 'cookies.md'), 'utf8')
};


exports['getting-started'] = {
    title: 'Começando',
    contents: Fs.readFileSync(Path.join(__dirname, 'getting-started.md'), 'utf8')
};


exports.logging = {
    title: 'Logging',
    contents: Fs.readFileSync(Path.join(__dirname, 'logging.md'), 'utf8')
};


exports.plugins = {
    title: 'Plugins',
    contents: Fs.readFileSync(Path.join(__dirname, 'plugins.md'), 'utf8')
};


exports.routing = {
    title: 'Roteando',
    contents: Fs.readFileSync(Path.join(__dirname, 'routing.md'), 'utf8')
};


exports['server-methods'] = {
    title: 'Métodos do Servidor',
    contents: Fs.readFileSync(Path.join(__dirname, 'server-methods.md'), 'utf8')
};


exports['serving-files'] = {
    title: 'Servindo Conteúdo Estático',
    contents: Fs.readFileSync(Path.join(__dirname, 'serving-files.md'), 'utf8')
};


exports.validation = {
    title: 'Validação',
    contents: Fs.readFileSync(Path.join(__dirname, 'validation.md'), 'utf8')
};


exports.views = {
    title: 'Visões',
    contents: Fs.readFileSync(Path.join(__dirname, 'views.md'), 'utf8')
};


exports.all = Object.keys(exports).map((slug) => ({ slug, title: exports[slug].title }));


exports.default = exports['getting-started'];
