'use strict';

const Fs = require('fs');
const Path = require('path');

exports.auth = {
    title: 'Kimlik Doğrulama',
    contents: Fs.readFileSync(Path.join(__dirname, 'auth.md'), 'utf8')
};


exports.caching = {
    title: 'Önbellekleme',
    contents: Fs.readFileSync(Path.join(__dirname, 'caching.md'), 'utf8')
};


exports.cookies = {
    title: 'Kurabiyeler',
    contents: Fs.readFileSync(Path.join(__dirname, 'cookies.md'), 'utf8')
};


exports['getting-started'] = {
    title: 'Başlarken',
    contents: Fs.readFileSync(Path.join(__dirname, 'getting-started.md'), 'utf8')
};


exports.logging = {
    title: 'Günlükleme',
    contents: Fs.readFileSync(Path.join(__dirname, 'logging.md'), 'utf8')
};


exports.plugins = {
    title: 'Eklentiler',
    contents: Fs.readFileSync(Path.join(__dirname, 'plugins.md'), 'utf8')
};


exports.routing = {
    title: 'Yol Tayin Etmek',
    contents: Fs.readFileSync(Path.join(__dirname, 'routing.md'), 'utf8')
};


exports['server-methods'] = {
    title: 'Sunucu Yöntemleri',
    contents: Fs.readFileSync(Path.join(__dirname, 'server-methods.md'), 'utf8')
};


exports['serving-files'] = {
    title: 'Durağan Dosya Sunumu',
    contents: Fs.readFileSync(Path.join(__dirname, 'serving-files.md'), 'utf8')
};


exports.validation = {
    title: 'Doğrulama',
    contents: Fs.readFileSync(Path.join(__dirname, 'validation.md'), 'utf8')
};


exports.views = {
    title: 'Kullanıcı Arayüzleri',
    contents: Fs.readFileSync(Path.join(__dirname, 'views.md'), 'utf8')
};


exports.all = Object.keys(exports).map((slug) => ({ slug, title: exports[slug].title }));


exports.default = exports['getting-started'];
