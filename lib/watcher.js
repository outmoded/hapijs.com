var Watch = require('watch');
var Path = require('path');
var Spawn = require('child_process').spawn;

// track running state with a simple boolean, since it's
// safe to ignore a second update while we're already building
// due to the nature of make
var running = false;
var rootPath = Path.resolve(__dirname, '..');
var pathRegex = /^(node_modules|output)/;

var make = function (file) {

    // don't overlap
    if (running) {
        return;
    }

    // redundant check because sometimes the events fire on filtered files.. don't know why
    if (pathRegex.test(file.slice(rootPath.length + 1))) {
        return;
    }

    running = true;

    var proc = Spawn('make', [], { cwd: rootPath, stdio: 'inherit' });
    proc.on('close', function () {

        running = false;
    });
};

var filter = function (file) {

    return !pathRegex.test(file.slice(rootPath.length + 1));
};

exports.watch = function () {

    Watch.createMonitor(rootPath, { filter: filter, ignoreDotFiles: true }, function (monitor) {

        monitor.on('created', make);
        monitor.on('changed', make);
        monitor.on('removed', make);
    });
};
