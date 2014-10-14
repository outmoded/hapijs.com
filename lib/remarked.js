var Highlight = require('highlight.js');
var Hoek = require('hoek');
var Remarked = require('remarked');

var internals = {};

internals.escape = function (str) {

    // remove code blocks
    var out = str.replace(/<\/?code\>/g, '');
    // replace brackets, parens, and dots with empty string, and anything that's not
    // a word character with a hyphen, a la github's anchor escaping
    return {
        clean: out,
        escaped: out.toLowerCase().replace(/[\(\)\[\]\.]/g, '').replace(/[^\w]+/g, '-')
    };
};

internals.renderer = new Remarked.Renderer();
internals.renderer.code = function (code, language) {

    var block = '<pre';
    if (this.options.singleColumn) {
        block += ' class="single-column"';
    }
    block += '><code>' + Highlight.highlight(language || 'js', code).value + '</code></pre>';

    return block;
};

internals.renderer.heading = function (text, level) {

    var header = internals.escape(text);

    return '<h' + level + '><a name="' + header.escaped + '" class="anchor" href="#' + header.escaped + '">' + header.clean + '</a></h' + level + '>';
};

internals.defaultOptions = {
    laxSpacing: true,
    renderer: internals.renderer
};

module.exports = function (str, options) {

    options = options || {};
    var settings = Hoek.applyToDefaults(internals.defaultOptions, options);
    return Remarked(str, settings);
};
