Node version: 12.20.2
Angular version: 13.3.0

Sample adapted from: https://v13.angular.io/generated/zips/i18n/i18n.zip

## Configuration

### package.json

The Translation.io module has been added to the dependencies, with a relative path:
```
  "@translation/angular": "file:../../",
```
The "extract" script has been fixed, from `"ng extract-i18n --output-path=locale"` to `"ng extract-i18n --output-path=src/locale"`, in order to have all locales in the same directory.

The following scripts have been added, to execute the Translation.io module:
```
  "translation:init": "npm run extract && tio init",
  "translation:sync": "npm run extract && tio sync"
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
