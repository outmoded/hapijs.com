# Hapijs.com

This is the home of [hapijs.com](http://hapijs.com). 

## Running/developing

* First, obtain a token from github [here](https://github.com/settings/tokens/new)

* Edit the `dev_config.json` file and put your token in the `githubToken` field

* Run the following commands

```bash
npm install
make
npm start
```

You may now visit `http://localhost:3000` in your browser to view the site.

The server also runs a file watcher that will automatically rebuild content when files are changed.
