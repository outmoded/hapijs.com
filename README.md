<a href="http://hapijs.com"><img src="https://raw.githubusercontent.com/hapijs/assets/master/images/family.png" width="180px" align="right" /></a>

# hapijs.com

<a href="https://www.packet.net"><img src="https://www.packet.net/assets/images/logo-main.png" height="80px" align="right"/></a>

This is the home of [hapijs.com](http://hapijs.com).

Lead Maintainer: [Jonas Pauthier](https://github.com/Nargonath)

**hapijs.com** is generously hosted by [packet](https://www.packet.net).

## Running/developing

* First, obtain a token from github [here](https://github.com/settings/tokens/new) and select checked scopes only (only two)

  - [ ] **repo**              :   *Full control of private repositories*
    - [x] **repo status**     :   *Access commit status*
    - [ ] **repo_deployment** :   *Access deployment status*
    - [x] **public_repo**     :   *Access public repositories*
    - [ ] **repo:invite**     :   *Access repository invitations*
 
For more details, here is github's [documentation](https://help.github.com/en/articles/creating-a-personal-access-token-for-the-command-line).

* Copy the `config/default.json` file to `config/local.json` and put your token in the `githubToken` field of `local.json`. NOTE: Please do not commit the file that contains your real github token. That would make it public and allow anyone to look at this repo and use your token as though they were you.

* Run the following commands

```bash
npm install
make
npm start or npm run dev (for automatic code reload)
```

You may now visit `http://localhost:3000` in your browser to view the site.

The server also runs a file watcher that will automatically rebuild content when files are changed.

Note: for committing you will need to include the public/* files that are generated during the make process.  The deploy does not do the make.

## Add a translation for the tutorials
In the directory `lib/tutorials` we have some directories with the name of the languages translated, to add a new translation, simply add a new folder in the `lib/tutorials` with your translation.
An Example, if you translate the tutorials, to Brazilian Portuguese, you must use the `pt_BR` as the name of the directory.
Inside the directory `pt_BR`, you need to follow the same struture we use in `en_US`, with all tutorials separated in markdown files and an `index.js` file that's export the tutorials and the titles.
After finish the translations, you also need add your translation in the `index.js` file inside `lib/tutorials`.

## Plugins
hapijs.com maintains a list of community-created plugins [here](http://hapijs.com/plugins). If there are any plugins you have created or one you use often that isn't listed please send a [pull request](https://github.com/hapijs/hapijs.com/blob/master/lib/plugins.js). Please note the existing categories, but if your plugin does not fit one feel free to create your own. Please keep the plugins in alphabetical order to be fair to all contributors.
