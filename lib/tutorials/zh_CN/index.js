'use strict';

const Fs = require('fs');
const Path = require('path');

exports.auth = {
    title: '身份验证',
    contents: Fs.readFileSync(Path.join(__dirname, 'auth.md'), 'utf8')
};


exports.caching = {
    title: '缓存',
    contents: Fs.readFileSync(Path.join(__dirname, 'caching.md'), 'utf8')
};


exports.cookies = {
    title: 'Cookies',
    contents: Fs.readFileSync(Path.join(__dirname, 'cookies.md'), 'utf8')
};


exports['getting-started'] = {
    title: '快速入门',
    contents: Fs.readFileSync(Path.join(__dirname, 'getting-started.md'), 'utf8')
};


exports.logging = {
    title: '日志',
    contents: Fs.readFileSync(Path.join(__dirname, 'logging.md'), 'utf8')
};


exports.plugins = {
    title: '插件',
    contents: Fs.readFileSync(Path.join(__dirname, 'plugins.md'), 'utf8')
};


exports.routing = {
    title: '路由',
    contents: Fs.readFileSync(Path.join(__dirname, 'routing.md'), 'utf8')
};


exports['server-methods'] = {
    title: '服务器方法',
    contents: Fs.readFileSync(Path.join(__dirname, 'server-methods.md'), 'utf8')
};


exports['serving-files'] = {
    title: '静态内容',
    contents: Fs.readFileSync(Path.join(__dirname, 'serving-files.md'), 'utf8')
};


exports.validation = {
    title: '数据验证',
    contents: Fs.readFileSync(Path.join(__dirname, 'validation.md'), 'utf8')
};


exports.views = {
    title: '视图',
    contents: Fs.readFileSync(Path.join(__dirname, 'views.md'), 'utf8')
};


exports.all = Object.keys(exports).map((slug) => ({ slug, title: exports[slug].title }));


exports.default = exports['getting-started'];
