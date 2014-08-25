var Cheerio = require('cheerio');
var Fs = require('fs');
var Highlight = require('highlight.js');
var Robotskirt = require('robotskirt');

// escape text for anchor tags
var escape = exports.escape = function (text) {

    // remove code blocks
    var out = text.replace(/<\/?code\>/g, '');
    // replace brackets, parens, and dots with empty string, and anything that's not
    // a word character with a hyphen, a la github's anchor escaping
    return {
        clean: out,
        escaped: out.toLowerCase().replace(/[\(\)\[\]\.]/g, '').replace(/[^\w]+/g, '-')
    };
};

var render = exports.render = function (markdown, withToc, singleColumn) {

    var title;
    var lastList;
    var inTOC = false;

    var renderer = new Robotskirt.HtmlRenderer();

    // Pre-highlight code blocks
    renderer.blockcode = function (code, language) {

        var block = '<pre';
        if (singleColumn) {
            block += ' class="single-column"';
        }
        block += '><code>' + Highlight.highlight(language || 'js', code).value + '</code></pre>';

        return block;
    };

    // Wrap lists in 'ul' tags, track the last list for TOC if we care
    renderer.list = function (text) {

        var list = '<ul>' + text + '</ul>';

        if (inTOC && withToc) {
            lastList = list;
        }

        return list;
    };

    // Escape text to make sure we have an anchor link for all headers
    // TOC is defined as all text between the first H1 and the first H2
    // The first H1 is set as the title and removed from the html output
    renderer.header = function (text, level) {

        var header = escape(text);

        if (level === 1) {
            if (!title) {
                title = header.clean;
                return '';
            }

            if (withToc) {
                inTOC = true;
            }
        }
        else if (level === 2) {
            if (inTOC && withToc) {
                inTOC = false;
            }
        }

        return '<h' + level + '><a name="' + header.escaped + '" class="anchor" href="#' + header.escaped + '">' + header.clean + '</a></h' + level + '>';
    };

    // the markdown lexer
    var parser = new Robotskirt.Markdown(renderer, [
        // allow tables
        Robotskirt.EXT_TABLES,
        // automatically turn urls into links
        Robotskirt.EXT_AUTOLINK,
        // allow github-style fenced code blocks
        Robotskirt.EXT_FENCED_CODE,
        // don't be so strict about whitespace
        Robotskirt.EXT_LAX_SPACING
    ]);

    // pass the lexed data through the parser to generate html
    var reference = parser.render(markdown);

    var toc = []; 

    if (withToc) {
        // parse the html with Cheerio
        var $ = Cheerio.load(reference);

        // TOC is the first 'ul'
        var ul = $('ul').first();

        // iterate over all 'a' tags in the first 'ul'
        $('a', ul).each(function () {

            var $this = $(this);
            // we count parents to see how deep in the TOC we are
            var depth = $this.parents().length;
            var anchor = escape($this.text());
            // blob representing the 'a' tag we're on now
            var blob = { tag: anchor.escaped, name: anchor.clean, children: [] };
            // default to the root of the toc
            var list = toc;

            // depth >= 4 means we're at least one level deep
            if (depth >= 4) {
                list = toc[toc.length - 1].children;
            }

            // go another level deeper
            if (depth >= 6) {
                list = list[list.length - 1].children;
            }

            // and one last level
            if (depth === 8) {
                list = list[list.length - 1].children;
            }

            // append the blob
            list.push(blob);
        });

        // remove the TOC
        ul.remove();
        // and set reference back to the raw html
        reference = $.html();
    }

    return { toc: toc, html: reference, title: title };
};

exports.file = function (source, callback, withToc, singleColumn) {

    Fs.readFile(source, 'utf8', function (err, contents) {
        
        if (err) {
            return callback(err);
        }

        callback(null, render(contents, withToc, singleColumn));
    });
};
