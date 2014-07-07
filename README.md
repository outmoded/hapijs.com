# Hapijs.com

This is the home of [hapijs.com](hapijs.com). 

## Running/developing

A server is provided to preview the content of the site, to use it run:

```bash
npm install
make watch
```

You'll see a bunch of lines starting with `./build.js` while the site builds.

Once that process is complete, you'll see a log entry informing you that the static preview is now running.

You may now visit `http://localhost:3000` in your browser to view the site.

The static preview server also runs a file watcher that will automatically rebuild content when files are changed. When this is taking place, you'll see more `./build.js` lines appear.
