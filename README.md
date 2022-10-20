# [Translation.io](https://translation.io/angular) client for Angular

[![Software License](https://img.shields.io/badge/license-MIT-brightgreen.svg?style=flat-square)](LICENSE)
[![Build Status](https://github.com/translation/angular/actions/workflows/test.yml/badge.svg?branch=master)](https://github.com/translation/angular/actions/workflows/test.yml)
[![Test Coverage](https://api.codeclimate.com/v1/badges/52c0801558cd21fa31dd/test_coverage)](https://codeclimate.com/github/translation/angular/test_coverage)
[![npm version)](https://img.shields.io/npm/v/@translation/angular)](https://www.npmjs.com/package/@translation/angular)

Add this package to localize your **Angular** application..

Use these official Angular 
<a href="#translation-syntaxes">`<p i18n>source text</p>`</a> template syntax
and <a href="#translation-syntaxes">``$localize `source text` ``</a> JavaScript syntax.

Write only the source text, and keep it synchronized with your translators 
on [Translation.io](https://translation.io/angular).

<a href="https://translation.io/angular">
  <img width="720px" alt="Translation.io interface" src="https://translation.io/gifs/translation.gif">
</a>

Need help? [contact@translation.io](mailto:contact@translation.io)

## Table of contents

* [Translation syntaxes](#translation-syntaxes)
  * [Template Syntax - Components](#template-syntax)
  * [JavaScript Syntax](#javascript-syntax)
* [Installation](#installation)
* [Usage](#usage)
  * [Sync](#sync)
  * [Read-only Sync](#read-only-sync)
  * [Sync & purge](#sync-&-purge)
* [Manage Languages](#manage-languages)
* [Translation syntaxes in details](#translation-syntaxes-in-details)
* [Advanced configuration options](#advanced-configuration-options)
* [List of clients for Translation.io](#list-of-clients-for-translationio)
  * [Ruby on Rails (Ruby)](#ruby-on-rails-ruby)
  * [Laravel (PHP)](#laravel-php)
  * [React, React Native and JavaScript](#react-react-native-and-javascript)
  * [Others](#others)
* [License](#license)

## Translation syntaxes

### Template Syntax - Components

Mark the text in a HTML element as translatable by using the `i18n` attribute in your components' templates.

~~~html
<!-- Simple use of the i18n attribute -->
<h1 i18n>Welcome to our Angular application!</h1>

<!-- Variable interpolation -->
<!-- Translators will see "Hi {name}, welcome to your dashboard!" -->
<p i18n>Hi {{ name }}, welcome to your dashboard!</p>

<!-- Simple HTML tags interpolation -->
<!-- Translators will see "Text with <1>HTML</1> tags." -->
<p i18n>Text with <em>HTML</em> tags.</p>

<!-- Translatable attribute -->
<img [src]="cat.png" i18n-alt alt="A fluffy cat" />

<!-- ICU plural form -->
<!-- Translators will see "There are no cats", "There is one cat", "There are {x} cats" -->
<p i18n>{count, plural,
  =0 {There are no cats}
  =1 {There is one cat}
  other {There are {{count}} cats}
}</p>

~~~

### JavaScript syntax

Mark text (literal strings) as translatable in your component classes and functions using `$localize` and surrounding the text with backticks ( \` ).

~~~javascript
// Simple use of the $localize function
let text = $localize `Welcome to our Angular application!`;
~~~

To explore the syntax more in details (specifying metadata, using plurals and interpolations), please check out the "[Translation syntaxes in details](#translation-syntaxes-in-details)" section below.


## Installation

### 1. Check your Angular i18n configuration

Make sure that you have [Angular's localize package](https://angular.io/guide/i18n-common-add-package) installed, or install it.

~~~bash
ng add @angular/localize
~~~

Configure the [i18n options](https://angular.io/guide/i18n-common-merge#define-locales-in-the-build-configuration) in the `angular.json` file at the root of your project.

### 2. Install our `@translation/angular` package

Run the following command at the root of your project to install our package:

~~~bash
# NPM
npm install @translation/angular

# Yarn
yarn add @translation/angular
~~~

### 3. Create a new translation project

Sign in to our platform and create your new project [from the UI](https://translation.io/angular), selecting the appropriate source and target locales.

### 4. Copy the generated `tio.config.json` file to the root of your application

This configuration file should look like this:

~~~json
{
  "api_key": "abcdefghijklmnopqrstuvwxyz123456",
  "source_locale": "en",
  "target_locales": ["fr", "it", "es"]
}
~~~

### 5. Add scripts to your package.json

To make your life easier, add these lines to the `package.json` at the root of your application:

~~~json
{
  "scripts": {
    "extract": "ng extract-i18n --output-path=src/locale",
    "translation:init": "npm run extract && tio init",
    "translation:sync": "npm run extract && tio sync"
  }
}
~~~

N.B. If you are using Angular version 10 or lower, replace **extract-i18n** by **xi18n** in the "extract" command.

### 6. Initialize your project

To push your source keys and existing translations (if any) to Translation.io, run the following command:

~~~bash
# NPM
npm run translation:init

# YARN
yarn translation:init
~~~

## Usage

### Sync

To push new translatable source keys/strings and get translations from Translation.io, simply run:

~~~bash
# NPM
npm run translation:sync

# YARN
yarn translation:sync
~~~

### Read-only Sync

To retrieve translations without pushing new source keys, you can run:

~~~bash
# NPM
npm run translation:sync -- --readonly

# YARN
yarn translation:sync -- --readonly
~~~

### Sync & Purge

If you need to remove unused source keys/strings from Translation.io, using your current local application as reference, run the following command:

~~~bash
# NPM
npm run translation:sync -- --purge

# YARN
yarn translation:sync -- --purge
~~~

**Warning:** all source keys/strings that are not present in your current local branch will be **permanently deleted from Translation.io**.

## Manage Languages

### Add or remove languages

You can add or remove a locale by updating `"target_locales": []` in your
`tio.config.json` file, and syncing your project again.

If you want to add a new locale with existing translations (for instance if you
already have a translated XLF file in your project), you will need to create a
new empty project on Translation.io and init your project for them to appear.

### Edit languages

To edit existing locales while keeping their translations (e.g. changing from `en` to `en-US`):

 1. Create a new project on Translation.io with the correct locales.
 2. Update the `tio.config.json` file with the new API key and correct locales.
 3. Adapt the locale codes in the  XLF files' names.
 4. Initialize your new project and check that everything went fine.
 5. Invite your collaborators in the new project.
 6. Remove the old project.

Since you created a new project, the translation history and tags will unfortunately be lost.


## Translation syntaxes in details

### i18n attributes and $localize

The text in a HTML element can be marked as translatable by using the `i18n` attribute in the components' templates.

~~~html
<h1 i18n>Welcome to our Angular application!</h1>
~~~

The attributes of HTML elements can also be marked as translatable by using `i18n-{attribute_name}` attributes.

~~~html
<img [src]="cat.png" i18n-alt alt="A fluffy cat" />
~~~

You can interpolate variables (component properties) into translatable strings.

~~~html
<!-- Translators will see "Hi {name}, welcome to your dashboard!" -->
<p i18n>Hi {{ name }}, welcome to your dashboard!</p>
~~~

And you can also interpolate **valid** HTML tags.

~~~html
<!-- Translators will see "Text with <1>HTML</1> tags." -->
<p i18n>Text with <em>HTML</em> tags.</p>

<!-- Translators will see "Text with a <1><2>partly-emphasized</2> link</1>." -->
<p i18n>Text with a <a href="#"><em>partly-emphasized</em> link</a>.</p>
~~~

Literal strings in your component classes and functions can also be marked as translatable using `$localize` and surrounding the source text with backticks ( \` ).

~~~javascript
let text = $localize `Hello, we hope you will enjoy this app.`;
~~~

This syntax also allows for variable interpolation.

~~~javascript
// Translators will see "Hi {name}, welcome to your dashboard!"
let text = $localize `Hi ${name}, welcome to your dashboard!`;
~~~

The official Angular documentation for the syntax can be found [here](https://angular.io/guide/i18n-common-prepare).

### Optional metadata for translation

You can use metadata as the value of the i18n attribute to specify a custom ID, a meaning and a description.

The syntax for the metadata, is the following: `{meaning}|{description}@@{custom_id}`

~~~html
<!-- Specifying only the meaning (the pipe | is required) -->
<h1 i18n="Welcome message|">Welcome to our app!</h1>

<!-- Specifying only the description -->
<h1 i18n="Message used on the homepage">Welcome to our app!</h1>

<!-- Specifying only the indetifier -->
<h1 i18n="@@home-welcome-message">Welcome to our app!</h1>

<!-- Specifying a meaning, a description and an identifier -->
<h1 i18n="Welcome message|Message used on the homepage@@home-welcome-message">Welcome to our app!</h1>
~~~

Metadata can also be used with `$localize`, but it must then be formatted as follows: `:{meaning}|{description}@@{custom_id}:{source_text}`.

~~~javascript
// Specifying only the meaning (the pipe | is required)
let text = $localize `:Welcome message|:Welcome to our Angular app!`;

// Specifying only the description
let text = $localize `:Message used on the homepage:Welcome to our Angular app!`;

// Specifying only the identifier
let text = $localize `:@@home-welcome-message:Welcome to our Angular app!`;

// Specifying a meaning, a description and an identifier
let text = $localize `:Welcome message|Message used on the homepage@@home-welcome-message:Welcome to our Angular app!`;
~~~

The official Angular documentation for optional metadata can be found [here](https://angular.io/guide/i18n-optional-manage-marked-text).

#### Our recommendations for metadata

The "unicity" of a source key is determined by its source text, its custom ID (if any) and its meaning (if any). The description plays no role in this unicity.

If you choose to use custom IDs, make sure that your IDs are unique (or that you always use the same source text with the same ID), otherwise only the first source text will be associated with the ID ([see official documentation](https://angular.io/guide/i18n-optional-manage-marked-text#define-unique-custom-ids)).

To avoid any problems, we strongly recommend that you opt for the use of "meanings" instead of IDs.
**Note:** If you use a meaning without a description, make sure to add a pipe (`|`) after the meaning, otherwise it will be considered as a description.

~~~html
<!-- Good use cases: -->

  <!-- Example 1
    The meaning helps distinguish between two keys with the same source text
    => This will result in two distinct source keys
  -->
  <span i18n="Numbered day in a calendar|">Date</span>
  <span i18n="Social meeting with someone|">Date</span>

  <!-- Example 2
    Adding a description after the meaning will be useful to translators
    => This will result in two distinct source keys
  -->
  <span i18n="Verb|Text on a button used to report a problem">Report</span>
  <span i18n="Noun|Title of the Report section in the app">Report</span>

<!-- Bad use cases: -->

  <!-- Example 1
    Using only descriptions, without meanings (note the missing pipe | )
    -> This will result in only one source key
  -->
  <label i18n="Label for the datepicker">Date</label>
  ...
  <option i18n="Type of event in a dropdown">Date</option>

  <!-- Example 2
    Using the same ID with two different source texts
    -> This will result in only one source key (the first one)
  -->
  <h2 i18n="@@section-title">First section</h2>
  <h2 i18n="@@section-title">Second section</h2>
~~~

### ICU expressions (plural and select)

#### Pluralization

Pluralization rules may vary from one locale to another, and it is recommended to use the plural syntax in your code to facilitate translation. This syntax is expressed as follows: `{ component_property, plural, pluralization_categories }`.

~~~html
<!-- Translators will see "There are no cats", "There is one cat", "There are {x} cats" -->
<p i18n>{count, plural,
  =0 {There are no cats}
  =1 {There is one cat}
  other {There are {{count}} cats}
}</p>
~~~

The official Angular documentation for plurals can be found [here](https://angular.io/guide/i18n-common-prepare#mark-plurals).

#### Select clause

The select clause allows to display alternate text depending on the value of a variable. This syntax is expressed as follows: `{ component_property, select, selection_categories }`.

~~~html
<span i18n>The user is {gender, select, male {a man} female {a woman} other { other }}.</span>
~~~

The official Angular documentation for select clauses can be found [here](https://angular.io/guide/i18n-common-prepare#mark-alternates-and-nested-expressions).

#### Our recommendations for plural and select expressions

To facilitate the work of translators, try to avoid complicated or nested expressions.

## Advanced configuration options

The `tio.config.json` file, at the root of your application, can take other optional configuration options.

We always favor "[_convention over configuration_](https://en.wikipedia.org/wiki/Convention_over_configuration)", so we strongly recommend that you use the default paths and file names in your localization process, but you may specify custom source and target paths for your application if necessary.

### Custom path for the source locale file

If your source locale file (XLF) is not located in the default `src/locale` directory and/or is not named `messages.xlf` (default name), you may specify a custom source locale path in your `tio.config.json` file:

~~~json
{
  "source_file_path" : "src/translations/sources.xlf"
}
~~~

**Warning!** The name of your source file should match the one generated by the `extract` script. Make sure to stay consistent in your `package.json`:

~~~json
{
  "scripts": {
    "extract": "ng extract-i18n --output-path=src/translations  --out-file=sources.xlf"
  }
}
~~~

### Custom path for target locale files

You may also specify a custom path for the target locale files (XLF) if you need them to have a name other than the defaut `messages.{lang}.xlf` or to be located in a directory other than the default `src/locale` directory. Simply add the following line to your `tio.config.json`, but make sure that it contains the `{lang}` placeholder as such:

~~~json
{
  "target_files_path": "src/translations/translations.{lang}.xlf"
}
~~~

or

~~~json
{
  "target_files_path": "src/locale/{lang}/translations.xlf"
}
~~~

Note: our package will attempt to create any missing directories. If it fails (for example, if permissions are strict on your side), please make sure to create the required directories manually.

### Proxy

If you need to use a proxy to connect to Translation.io, add the following line to your `tio.config.json` file:

~~~json
{
  "proxy": "http://login:pass@127.0.0.1:8080"
}
~~~

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
