var Fs = require('fs');
var Path = require('path');

module.exports = (function () {

    var tutorialPath = Path.join(__dirname, '..', 'templates', 'tutorials');
    return Fs.readdirSync(tutorialPath).filter(function (file) {
        
        return /\.jade$/.test(file);
    }).map(function (file) {

        var contents = Fs.readFileSync(Path.join(tutorialPath, file), 'utf8');
        var lines = contents.split('\n');
        for (var i = 0, l = lines.length; i < l; ++i) {
            var line = lines[i];
            title = /^ *title ([\w ]+)/.exec(line);
            if (title) {
                break;
            }
        }

        return {
            name: title[1],
            slug: file.replace(/\.jade$/, '')
        };
    });
})();
