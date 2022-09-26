# [Translation.io](https://translation.io/angular) client for Angular

[![Software License](https://img.shields.io/badge/license-MIT-brightgreen.svg?style=flat-square)](LICENSE)
[![Build Status](https://github.com/translation/angular/actions/workflows/test.yml/badge.svg?branch=master)](https://github.com/translation/angular/actions/workflows/test.yml)
[![Test Coverage](https://api.codeclimate.com/v1/badges/52c0801558cd21fa31dd/test_coverage)](https://codeclimate.com/github/translation/angular/test_coverage)
[![npm version)](https://img.shields.io/npm/v/@translation/angular)](https://www.npmjs.com/package/@translation/angular)

Add this package to localize your Angular application (see [Installation](#installation)).

Use the [official Angular i18n syntax](#localization-syntax-overview) in your components.

Write only the source text in your Angular application, and keep it synchronized with your translators on [Translation.io](https://translation.io/angular).

<a href="https://translation.io/laravel">
  <img width="720px" alt="Translation.io interface" src="https://translation.io/gifs/translation.gif">
</a>

Need help? [contact@translation.io](mailto:contact@translation.io)


Table of contents
=================
* [Localization syntax overview](#localization-syntax-overview)
  * [i18n attribute in templates](#i18n-attribute-in-templates)
  * [$localize for literal string in code](#$localize-for-literal-string-in-code)
* [Installation](#installation)
* [Usage](#usage)
  * [Sync](#sync)
  * [Read-only Sync](#read-only-sync)
  * [Sync & purge](#sync-&-purge)
* [Manage locales](#manage-locales)
* [Localization syntax in details](#localization-syntax-in-details)
* [List of clients for Translation.io](#list-of-clients-for-translationio)
  * [Ruby on Rails (Ruby)](#ruby-on-rails-ruby)
  * [Laravel (PHP)](#laravel-php)
  * [React, React Native and JavaScript](#react-react-native-and-javascript)
  * [Others](#others)
* [License](#license)


## Localization syntax overview
### i18n attribute in templates

Mark the text in a HTML element as translatable by using the `i18n` attribute in your components' templates.

```html
<h1 i18n>Welcome to our Angular app!</h1>
<p i18n>This is a first paragraph.</p>
```

Mark the attributes of HTML elements as translatable by using `i18n-{attribute_name}` attributes.

```html
// Marking an image's title attribute as translatable
<img [src]="example-image" i18n-title title="Example image title" />
```

### $localize for literal strings in code

Mark text (literal strings) as translatable in your component code using `$localize` and surrounding the text with backticks ( \` ).

```javascript
// Marking a literal string as translatable
$localize `Hello, we hope you will enjoy this app.`;
```

To explore the syntax more in details (using IDs, specifying plurals and interpolations), please check out the section [Localization syntax in details](#localization-syntax-in-details) below.


## Installation

### 1. Install the localize package and set up your i18n options

Make sure that you have Angular's [localize package](https://angular.io/guide/i18n-common-add-package) installed, or install it.

```bash
ng add @angular/localize
```

Configure the [i18n options](https://angular.io/guide/i18n-common-merge#define-locales-in-the-build-configuration) in the `angular.json` file at the root of your project.

### 2. Install the `@translation/angular` package

Run the following command at the root of your project to install our package:

```bash
# NPM
npm install @translation/angular

# Yarn
yarn add @translation/angular
```

### 3. Create a new translation project

Sign in to our platform and create your new project [from the UI](https://translation.io/angular), selecting the appropriate source and target locales.

### 4. Copy the generated `tio.config.json` file to the root of your application.

This configuration file should look like this:
```json
{
  "api_key": "abcdefghijklmnopqrstuvwxyz123456",
  "source_locale": "en",
  "target_locales": ["fr", "es", "it"]
}
```

### 5. Add scripts to your package.json

To make your life easier, add these lines to the `package.json` at the root of your application:

```json
{
  "scripts": {
    "translation:init": "npm run extract && tio init",
    "translation:sync": "npm run extract && tio sync"
  }
}
```

### 6. Initialize your project

To push your source keys and existing translations (if any) to Translation.io, run the following command:

```bash
# NPM
npm run translation:init

# YARN
yarn translation:init
```


## Usage

### Sync

To push new translatable source keys/strings and get translations from Translation.io, simply run:

```bash
# NPM
npm run translation:sync

# YARN
yarn translation:sync
```

### Read-only Sync

To retrieve translations without pushing new source keys, you can run:

```bash
# NPM
npm run translation:sync -- --readonly

# YARN
yarn translation:sync -- --readonly
```

### Sync & Purge

If you need to remove unused source keys/strings from Translation.io, using your current local application as reference, run the following command:

```bash
# NPM
npm run translation:sync -- --purge

# YARN
yarn translation:sync -- --purge
```

**Warning:** all source keys/strings that are not present in your current local branch will be **permanently deleted from Translation.io**.


## Manage locales

### Add or remove locales

You can add or remove a locale by updating `"target_locales": []` in your
`tio.config.json` file, and syncing your project again.

If you want to add a new locale with existing translations (for instance if you
already have a translated XLF file in your project), you will need to create a
new empty project on Translation.io and init your project for them to appear.

### Edit locales

To edit existing locales while keeping their translations (e.g. changing from `en` to `en-US`):

 1. Create a new project on Translation.io with the correct locales.
 2. Update the `tio.config.json` file with the new API key and correct locales.
 3. Adapt the locale codes in the  XLF files' names.
 4. Initialize your new project and check that everything went fine.
 5. Invite your collaborators in the new project.
 6. Remove the old project.

Since you created a new project, the translation history and tags will unfortunately be lost.


## Localization syntax in details

### i18n attributes and $localize

The text in a HTML element can be marked as translatable by using the `i18n` attribute in the components' templates.

```html
<h1 i18n>Welcome to our Angular app!</h1>
<p i18n>This is a first paragraph.</p>
```

The attributes of HTML elements can also be marked as translatable by using `i18n-{attribute_name}` attributes.

```html
// Marking the title attribute of an image as translatable
<img [src]="example-image" i18n-title title="Example image title" />
```

Literal strings in your component code can also be marked as translatable using `$localize` and surrounding the source text with backticks ( \` ).

```javascript
// Marking a literal string as translatable
$localize `Hello, we hope you will enjoy this app.`;
```

The official Angular documentation for the syntax can be found [here](https://angular.io/guide/i18n-common-prepare).

### Optional metadata for translation

You can use metadata as the value of the i18n attribute to specify a custom ID, a meaning and a description.

The syntax for the metadata is the following: `{meaning}|{description}@@{custom_id}`

```html
<h1 i18n="Welcome message|Message used on the homepage@@home-welcome-message">Welcome to our Angular app!</h1>
```

Metadata can also be used with `$localize`, but it must then be formatted as follows: `{meaning}:{description}@@{custom_id}:{source_text}`.

```javascript
let welcomeText = $localize `Welcome message:Message used on the homepage@@home-welcome-message:Welcome to our Angular app!`;
```

The official Angular documentation for optional metadata can be found [here](https://angular.io/guide/i18n-optional-manage-marked-text).

#### Our recommendations for metadata

The "unicity" of a source key is determined by its source text, its custom ID (if any) and its meaning (if any). The description plays no role in this unicity.

If you choose to use custom IDs, make sure that your IDs are unique (or that you always use the same source text with the same ID), otherwise only the first source text will be associated with the ID ([see official documentation](https://angular.io/guide/i18n-optional-manage-marked-text#define-unique-custom-ids)).

To avoid any problems, we strongly recommend that you opt for the use of "meanings" instead of IDs.
**Note:** If you use a meaning without a description, make sure to add a pipe (`|`) after the meaning, otherwise it will be considered as a description.

```html
// Good use cases:

  /*
    1. The meaning helps distinguish between two keys with the same source text
    -> This will result in two distinct source keys
  */
  <span i18n="Numbered day in a calendar|">Date</span> // Meaning only
  <span i18n="Social meeting with someone|">Date</span> // Meaning only

  /*
    2. Adding a description after the meaning will be useful to translators
    -> This will result in two distinct source keys
  */
  <span i18n="Verb|Text on a button used to report a problem">Report</span>
  <span i18n="Noun|Title of the Report section in the app">Report</span>

// Bad use cases:

  /*
    1. Using only descriptions, without meanings (note the missing pipe | )
    -> This will result in only one source key
  */
  <label i18n="Label for the datepicker">Date</label>
  ...
  <option i18n="Type of event in a dropdown">Date</option>

  /*
    2. Using the same ID with two different source texts
    -> This will result in only one source key (the first one)
  */
  <h2 i18n="@@section-title">First section</h2>
  <h2 i18n="@@section-title">Second section</h2>
```

### ICU expressions (plural and select)

#### Pluralization

Pluralization rules may vary from one locale to another, and it is recommended to use the plural syntax in your code to facilitate translation. This syntax is expressed as follows: `{ component_property, plural, pluralization_categories }`.

```html
<span i18n>{catsCount, plural, =0 {There are no cats in the room} =1 {There is one cat in the room} other {There are {{catsCount}} cats in the room}}</span>
```

The official Angular documentation for plurals can be found [here](https://angular.io/guide/i18n-common-prepare#mark-plurals).

#### Select clause

The select clause allows to display alternate text depending on the value of a variable. This syntax is expressed as follows: `{ component_property, select, selection_categories }`.

```html
<span i18n>The user is {gender, select, male {a man} female {a woman} other { other }}.</span>
```

The official Angular documentation for select clauses can be found [here](https://angular.io/guide/i18n-common-prepare#mark-alternates-and-nested-expressions).

#### Our recommendations for plural and select expressions

To facilitate the work of translators, try to avoid complicated or nested expressions.

## List of clients for Translation.io

Implementations were usually started by contributors for their own projects.
The following are officially supported by [Translation.io](https://translation.io)
and are well documented.

We are thankful to all contributors for their hard work!

### Ruby on Rails (Ruby)

Officially supported on [https://translation.io/rails](https://translation.io/rails)

 * GitHub: https://github.com/translation/rails
 * RubyGems: https://rubygems.org/gems/translation/

Credits: [@aurels](https://github.com/aurels), [@michaelhoste](https://github.com/michaelhoste)

### Laravel (PHP)

Officially supported on [https://translation.io/laravel](https://translation.io/laravel)

 * GitHub: https://github.com/translation/laravel
 * Packagist: https://packagist.org/packages/tio/laravel

Credits: [@armandsar](https://github.com/armandsar), [@michaelhoste](https://github.com/michaelhoste)

### React, React Native and JavaScript

Officially supported on [https://translation.io/lingui](https://translation.io/lingui)

Translation.io is directly integrated in the great
[Lingui](https://lingui.js.org/) internationalization project.

 * GitHub: https://github.com/translation/lingui
 * NPM: https://www.npmjs.com/package/@translation/lingui

### Angular

Officially supported on [https://translation.io/angular](https://translation.io/angular)

 * GitHub: https://github.com/translation/angular
 * NPM: https://www.npmjs.com/package/@translation/angular

### Others

If you want to create a new client for your favorite language or framework, please read our
[Create a Translation.io Library](https://translation.io/docs/create-library)
guide and use the special
[init](https://translation.io/docs/create-library#initialization) and
[sync](https://translation.io/docs/create-library#synchronization) endpoints.

You can also use the more [traditional API](https://translation.io/docs/api).

Feel free to contact us on [contact@translation.io](mailto:contact@translation.io)
if you need some help or if you want to share your library.

## Licence

The MIT License (MIT). Please see [License File](LICENSE) for more information.
