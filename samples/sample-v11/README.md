Node version: 10.13.0
Angular version: 11.2.10

Sample adapted from: https://v11.angular.io/generated/zips/i18n/i18n.zip

## Installation

Before running `npm install`, run the following commands to use the appropriate version of python (python2, not python3), required by 'node-gyp':

```
brew install pyenv
pyenv install 2.7.18
pyenv local 2.7.18
echo "export PATH=\"\${HOME}/.pyenv/shims:\${PATH}\"" >> ~/.zshrc
```

## Configuration

### package.json

The Translation.io module has been added to the dependencies, with a relative path:
```
  "@translation/angular": "file:../../",
```
The "extract" script has been fixed, from `"ng extract-i18n --output-path=locale"` to `"ng extract-i18n --output-path=src/locale"`, in order to have all locales in the same directory.

The following scripts have been added, to execute the Translation.io module:
```
  "i18n": "npm run extract",
  "build-i18n-and-translation-init": "npm run i18n && npm run translation-init",
  "build-i18n-and-translation-sync": "npm run i18n && npm run translation-sync",
  "translation-init": "tio init",
  "translation-sync": "tio sync",
  "translation-sync-readonly": "tio sync --readonly",
  "translation-sync-purge": "tio sync --purge"
```

### angular.json

The following block has been added, to skip manual consent when using the Angular CLI:
```
  "cli": {
    "analytics": false
  }
```

### tio.config.json

The Translation.io config file has been created and uses the API key of a project that should be truncated regularly.

### Component template

The original 'app.component.html' file has been modified to replace the nested "plural" and "select" interpolations by successive interpolations, which makes more sense.
