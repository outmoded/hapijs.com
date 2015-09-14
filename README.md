# Hapijs.com

<a href="https://andyet.com"><img src="https://s3.amazonaws.com/static.andyet.com/images/%26yet-logo.svg" align="right" /></a>
This is the home of [hapijs.com](http://hapijs.com).

Lead Maintainer: [Nathan LaFreniere](https://github.com/nlf)

**hapijs.com** is sponsored by [&yet](https://andyet.com).

## Running/developing

* First, obtain a token from github [here](https://github.com/settings/tokens/new)

* Copy the `config/default.json` file to `config/local.json` and put your token in the `githubToken` field of `local.json`. NOTE: Please do not commit the file that contains your real github token. That would make it public and allow anyone to look at this repo and use your token as though they were you.

* Run the following commands

```bash
npm install
make
npm start
```

You may now visit `http://localhost:3000` in your browser to view the site.

The server also runs a file watcher that will automatically rebuild content when files are changed.

Note: for committing you will need to include the public/* files that are generated during the make process.  The deploy does not do the make.

## Plugins
hapijs.com maintains a list of community-created plugins [here](http://hapijs.com/plugins). If there are any plugins you have created or one you use often that isn't listed please send a [pull request](https://github.com/hapijs/hapijs.com/blob/master/lib/plugins.js). Please note the existing categories, but if your plugin does not fit one feel free to create your own. Please keep the plugins in alphabetical order to be fair to all contributors.
