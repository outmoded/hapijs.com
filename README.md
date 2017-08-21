# Hapijs.com

<a href="https://andyet.com"><img src="https://s3.amazonaws.com/static.andyet.com/images/%26yet-logo.svg" height="80px" align="right"/></a>
<img src="https://upload.wikimedia.org/wikipedia/commons/c/ca/1x1.png" height="1px" width="100%"/>
<a href="https://www.packet.net"><img src="https://www.packet.net/assets/images/logo-main.png" height="80px" align="right"/></a>

This is the home of [hapijs.com](http://hapijs.com).

Lead Maintainer: [Nathan LaFreniere](https://github.com/nlf)

**hapijs.com** is sponsored by [&yet](https://andyet.com) with a very special thanks to [packet](https://www.packet.net) for providing our hosting.

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

## Add a translation for the tutorials
In the directory `lib/tutorials` we have some directories with the name of the languages translated, to add a new translation, simply add a new folder in the `lib/tutorials` with your translation.
An Example, if you translate the tutorials, to Brazilian Portuguese, you must use the `pt_BR` as the name of the directory.
Inside the directory `pt_BR`, you need to follow the same struture we use in `en_US`, with all tutorials separated in markdown files and an `index.js` file that's export the tutorials and the titles.
After finish the translations, you also need add your translation in the `index.js` file inside `lib/translations`.

## Plugins
hapijs.com maintains a list of community-created plugins [here](http://hapijs.com/plugins). If there are any plugins you have created or one you use often that isn't listed please send a [pull request](https://github.com/hapijs/hapijs.com/blob/master/lib/plugins.js). Please note the existing categories, but if your plugin does not fit one feel free to create your own. Please keep the plugins in alphabetical order to be fair to all contributors.

## Community

We'd love to hear from people using hapi, and add them to our [community listing](http://hapijs.com/community). You can get yourself added in a few steps:

1. Fork the [hapijs.com repository](https://github.com/hapijs/hapijs.com)
1. Add your logo to the [public/img](https://github.com/hapijs/hapijs.com/tree/master/public/img) folder. It should be in png format, at least 300 pixels wide. The name should follow the format `logo-<yourcompanyname>.png`.
1. Add an entry to the bottom of the hash in [lib/community.js](https://github.com/hapijs/hapijs.com/blob/master/lib/community.js) including:
  * url: Your company or project's url.
  * logo: The unqualified filename of the logo you added above.
  * description: a short (~300 characters) user quote, describing your hapi user experience.
  * person: used for quote attribution
  * height / width: Used to control the image rendering size - use one or both of these to make your logo render correctly.
1. Submit a PR!