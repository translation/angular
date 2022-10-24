# [Translation.io](https://translation.io/angular) client for Angular

[![Software License](https://img.shields.io/badge/license-MIT-brightgreen.svg?style=flat-square)](LICENSE)
[![Build Status](https://github.com/translation/angular/actions/workflows/test.yml/badge.svg?branch=master)](https://github.com/translation/angular/actions/workflows/test.yml)
[![Test Coverage](https://api.codeclimate.com/v1/badges/52c0801558cd21fa31dd/test_coverage)](https://codeclimate.com/github/translation/angular/test_coverage)
[![npm version)](https://img.shields.io/npm/v/@translation/angular)](https://www.npmjs.com/package/@translation/angular)

Add this package to localize your **Angular** application.

Use these [official](https://angular.io/guide/i18n-common-prepare) Angular localization syntaxes:

* <a href="#template--components">`<p i18n>source text</p>`</a> in templates.
* <a href="#javascript">``$localize `source text` ``</a>  in JavaScript.

Write only the source text, and keep it synchronized with your translators 
on [Translation.io](https://translation.io/angular).

<a href="https://translation.io/angular">
  <img width="720px" alt="Translation.io interface" src="https://translation.io/gifs/translation.gif">
</a>

 

Don't bother your translators with obscure `.XLF` files. Make them use our clean
interface to translate complex singular and plurals strings:

[![XLF files plural interface](https://github.com/translation/angular/raw/master/misc/angular-xlf-to-interface.png)](https://translation.io/angular)

Need help? [contact@translation.io](mailto:contact@translation.io)

## Table of contents

* [Localization syntaxes](#localization-syntaxes)
  * [Template & Components](#template--components)
  * [JavaScript](#javascript)
* [Installation](#installation)
* [Usage](#usage)
  * [Sync](#sync)
  * [Sync and Purge](#sync-and-purge)
* [Manage Languages](#manage-languages)
  * [Add or Remove Language](#add-or-remove-language)
  * [Edit Language](#edit-language)
  * [Custom Languages](#custom-languages)
* [Continuous Integration](#continuous-integration)
* [Advanced Configuration Options](#advanced-configuration-options)
   * [Source File Path](#source-file-path)
   * [Target Files Path](#target-files-path)
   * [Proxy](#proxy)
* [Localization - Good Practices](#localization---good-practices)
* [Testing](#testing)
* [Contributing](#contributing)
* [List of clients for Translation.io](#list-of-clients-for-translationio)
  * [Ruby on Rails (Ruby)](#ruby-on-rails-ruby)
  * [Laravel (PHP)](#laravel-php)
  * [React, React Native and JavaScript](#react-react-native-and-javascript)
  * [Others](#others)
* [License](#license)

## Localization syntaxes

### Template & Components

Mark text as being translatable by using the `i18n` attribute in your templates.

#### Singular

~~~html
<!-- Regular -->
<h1 i18n>
  Text to be translated
</h1>

<!-- Variable interpolation -->
<!-- Translators will see "Hi {name}" -->
<p i18n>
  Hi {{ name }}
</p>

<!-- Simple HTML tags -->
<!-- Translators will see "Text with <1>HTML</1> tags" -->
<p i18n>
  Text with <em>HTML</em> tags
</p>

<!-- Complex HTML Tags -->
<!-- Translators will see "Text with a <1>link</1>" -->
<p i18n>
  Text with a
  <a href="https://google.com" target="_blank">link</a>
</p>

<!-- Translatable attribute -->
<img [src]="cat.png" i18n-alt alt="Text to be translated" />

<!-- Context -->
<!-- Differentiate translations for the same source text -->
<span i18n="meeting someone|">
  Date
</span>

<span i18n="moment in time|">
  Date
</span>

<!-- Comment -->
<!-- Provide a plain-text description to the translators in the interface -->
<span i18n="Big button at the bottom of the invoicing page">
  Send the invoice
</span>

<!-- Context & Comment -->
<span i18n="invoicing|Big button at the bottom of the invoicing page">
  Send the invoice
</span>
~~~

#### Plural

The plural syntax is supported using the [ICU MessageFormat](https://unicode-org.github.io/icu/userguide/format_parse/messages/). Multiple plural forms
for each language are embedded into the same string, using a specific syntax with 
curly braces.

These examples may seem easy for developers but are hard for translators to work with, 
without making any syntax mistake.

That's why on Translation.io, we made sure that translators will only be able to see 
the sentences to translate, and only the correct existing plural forms for their 
target language.

~~~html
<!-- Regular -->
<p i18n>{count, plural,
  one   {You've got 1 message}
  other {You've got {{count}} messages}}
</p>

<!-- Custom plural forms -->
<p i18n>{count, plural,
  =0    {Your inbox is empty!}
  =42   {You've found the ultimate answer}
  one   {You've got 1 message}
  other {You've got {{count}} messages}}
</p>

<!-- Variable interpolation -->
<p i18n>{count, plural,
  one   {Hello {{name}}, you've got 1 message}
  other {Hello {{name}}, you've got {{count}} messages}}
</p>

<!-- HTML tags -->
<p i18n>{count, plural,
  one   {Hello {{name}}, you've got <strong>1</strong> message}
  other {Hello {{name}}, you've got <strong>{{count}}</strong> messages}}
</p>
~~~

**Note:** English has only 2 plural forms (`one` and `other`), but other languages
have more of them, from this list: `zero`, `one`, `two`, `few`, `many`,
`other`.

You can find the complete list of plural forms and plural rules here:
https://translation.io/docs/languages_with_plural_cases

### JavaScript

Mark text as being translatable by using `$localize` and surrounding the text with backticks ( \` ).

~~~javascript
// Regular
$localize `Text to be translated`;

// Variable interpolation
$localize `Hello ${name}`;

// Context
// Differentiate translations for the same source text
$localize `:meeting someone|:Date`;
$localize `:moment in time|:Date`;

// Comment
// Provide a plain-text description to the translators in the interface
$localize `:Big button at the bottom of the invoicing page:Send the invoice`;

// Context & Comment
$localize `:invoicing|Big button at the bottom of the invoicing page:Send the invoice`;
~~~

## Installation

### 1. Check your Angular i18n configuration

Make sure that you have [Angular's localize package](https://angular.io/guide/i18n-common-add-package) installed, or install it.

~~~bash
ng add @angular/localize
~~~

Configure the [i18n options](https://angular.io/guide/i18n-common-merge#define-locales-in-the-build-configuration) in your `angular.json` file.

### 2. Install our package

~~~bash
# NPM
npm install @translation/angular

# Yarn
yarn add @translation/angular
~~~

### 3. Add the following scripts

Add these lines to your `package.json` to make your life easier:

~~~json
{
  "scripts": {
    "extract": "ng extract-i18n --output-path=src/locale",
    "translation:init": "npm run extract && tio init",
    "translation:sync": "npm run extract && tio sync"
  }
}
~~~

**Note:** If you are using Angular version 10 or lower, replace **extract-i18n** by **xi18n** in the "extract" command.

### 4. Create a new translation project

Sign in to [Translation.io](https://translation.io/angular) and create a new project, selecting the appropriate source and target locales.

### 5. Configure your project

Copy the generated `tio.config.json` file to the root of your application.

The configuration file looks like this:

~~~json
{
  "api_key": "abcdefghijklmnopqrstuvwxyz123456",
  "source_locale": "en",
  "target_locales": ["fr", "it", "es"]
}
~~~

### 6. Initialize your project

Run the following command to push your source keys and existing translations to Translation.io

~~~bash
# NPM
npm run translation:init

# YARN
yarn translation:init
~~~

## Usage

### Sync

Push new translatable source keys/strings and get translations from Translation.io with:

~~~bash
# NPM
npm run translation:sync

# YARN
yarn translation:sync
~~~

### Sync and Purge

Remove unused source keys/strings from Translation.io, using your current local application as reference, with:

~~~bash
# NPM
npm run translation:sync -- --purge

# YARN
yarn translation:sync -- --purge
~~~

**Warning:** all source keys/strings that are not present in your current local branch will be **permanently deleted from Translation.io**.

## Manage Languages

### Add or Remove Language

You can add or remove a locale by updating `"target_locales": []` in your
`tio.config.json` file, and syncing your project again.

If you want to add a new locale with existing translations (for instance if you
already have a translated XLF file in your project), you will need to create a
new empty project on Translation.io and init it for the first time again.

### Edit Language

To edit existing locales while keeping their translations (e.g. changing from `en` to `en-US`):

 1. Create a new project on Translation.io with the correct locales.
 2. Update the `tio.config.json` file with the new API key and correct locales.
 3. Adapt the locale codes in the  XLF files' names.
 4. Initialize your new project and check that everything went fine.
 5. Invite your collaborators in the new project.
 6. Remove the old project.

Since you created a new project, the translation history and tags will unfortunately be lost.

### Custom Languages

Custom languages are convenient if you want to customize translations for a specific customer
or another instance of your application.

A custom language is always be derived from an [existing language](https://translation.io/docs/languages).
Its structure should be like:

~~~javascript
`${existingLanguageCode}-${customText}`
~~~

where `customText` can only contain alphabetic characters and `-`.

Examples: `en-microsoft` or `fr-BE-custom`.

## Continuous Integration

If you want fresh translations in your Continuous Integration workflow, you may
find yourself calling `npm run translation:sync` very frequently.

Since this task can't be concurrently executed
(we have a [mutex](https://en.wikipedia.org/wiki/Mutual_exclusion) strategy with
a queue but it returns an error under heavy load), we implemented this
threadsafe readonly task:

~~~bash
# NPM
npm run translation:sync -- --readonly

# YARN
yarn translation:sync -- --readonly
~~~

This task will prevent your CI from failing and still provide new translations. But
be aware that it won't send new keys from your code to Translation.io so you
still need to sync at some point during development.

## Advanced Configuration Options

The `tio.config.json` file, at the root of your application, can take other optional configuration options.

We always favor "[_convention over configuration_](https://en.wikipedia.org/wiki/Convention_over_configuration)", so we strongly recommend that you use the default paths and file names in your localization process, but you may specify custom source and target paths for your application if necessary.

### Source File Path

You may specify a custom source locale path in your `tio.config.json` file 
if your source locale file (XLF) is not located in the default `src/locale` 
directory and/or is not named `messages.xlf` (default name):

~~~json
{
  "source_file_path" : "src/translations/sources.xlf"
}
~~~

**Warning!** The name of your source file should match the one generated by the `extract` script. 
Make sure to stay consistent in your `package.json`:

~~~json
{
  "scripts": {
    "extract": "ng extract-i18n --output-path=src/translations  --out-file=sources.xlf"
  }
}
~~~

### Target Files Path

You may specify a custom path for the target locale files (XLF) if you need them 
to have a name other than the defaut `messages.{lang}.xlf` or to be located in 
a directory other than the default `src/locale` directory. 

Simply add the following line to your `tio.config.json`, but make sure that it 
contains the `{lang}` placeholder as such:

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

### Proxy

If you need to use a proxy to connect to Translation.io, add the following line to your `tio.config.json` file:

~~~json
{
  "proxy": "http://login:pass@127.0.0.1:8080"
}
~~~

## Localization - Good Practices

The "unicity" of a source key is determined by its source text and its context 
(if any). The comment plays no role in this unicity.

If you use a meaning without a comment, make sure to add a 
pipe (`|`) after the meaning, otherwise it will be considered as a comment.

### Good use cases

~~~html
<!--
  The context helps distinguish between two keys with the same source text
   => This will result in two distinct source keys
-->
<span i18n="Numbered day in a calendar|">Date</span>
<span i18n="Social meeting with someone|">Date</span>

<!--
  Adding a comment after the context will be useful to translators
   => This will result in two distinct source keys
-->
<span i18n="Verb|Text on a button used to report a problem">Report</span>
<span i18n="Noun|Title of the Report section in the app">Report</span>
~~~

### Bad use case

~~~html
<!--
  Using only comments, without context (note the missing pipe | )
   => This will result in only one source key
-->
<span i18n="Label for the datepicker">Date</span>
<span i18n="Type of event in a dropdown">Date</span>
~~~

## Testing

Run the specs with:

~~~bash
jest
~~~

or 

~~~bash
npm run test
~~~

Please note that [GitHub Actions](.github/workflows/test.yml) contains more specs including real synchronization 
tests between different versions of Angular projects and Translation.io.

## Contributing

Please read the [CONTRIBUTING](CONTRIBUTING.md) file.

## List of clients for Translation.io

The following clients are officially supported by [Translation.io](https://translation.io)
and are well documented.

Some of these implementations (and other non-officially supported ones)
were started by contributors for their own translation projects.
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
 
Credits: [@SimonCorellia](https://github.com/SimonCorellia), [@didier-84](hthttps://github.com/didier-84), [@michaelhoste](https://github.com/michaelhoste)

### Others

If you want to create a new client for your favorite language or framework, please read our
[Create a Translation.io Library](https://translation.io/docs/create-library)
guide and use the special
[init](https://translation.io/docs/create-library#initialization) and
[sync](https://translation.io/docs/create-library#synchronization) endpoints.

You can also use the more [traditional API](https://translation.io/docs/api).

Feel free to contact us on [contact@translation.io](mailto:contact@translation.io)
if you need some help or if you want to share your library.

## License

The MIT License (MIT). Please see [License File](LICENSE) for more information.
