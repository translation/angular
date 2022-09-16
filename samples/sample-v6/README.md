Node version: 10.9.0 (will not work with 8.9)
Angular version: 6.0.0

Sample adapted from: https://v6.angular.io/generated/zips/i18n/i18n.zip

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

The "rxjs" dependency has been changed from `"^6.0.0"` to `"6.0.0"`, to fix a bug arising when the "extract" script is run.

The Translation.io module has been added to the dependencies, with a relative path:
```
  "@translation/angular": "file:../../",
```

The following scripts have been added, to execute the Translation.io module:
```
  "translation:init": "npm run extract && tio init",
  "translation:sync": "npm run extract && tio sync"
```

### tio.config.json

The Translation.io config file has been created and uses the API key of a project that should be truncated regularly.

### Component template

The original 'app.component.html' file has been modified to replace the nested "plural" and "select" interpolations by successive interpolations, which makes more sense.
