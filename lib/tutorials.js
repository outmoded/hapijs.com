var Fs = require('fs');
var Path = require('path');

exports.tutorials = (function () {

    var tutorialPath = Path.join(__dirname, '..', 'tutorials');
    return Fs.readdirSync(tutorialPath).filter(function (file) {
        
        return /\.md$/.test(file);
    }).map(function (file) {

        var contents = Fs.readFileSync(Path.join(tutorialPath, file), 'utf8');
        return {
            name: contents.split('\n')[0].replace(/^#/, '').trim(),
            slug: file.replace(/\.md$/, '')
        };
    });
})();
