# Changelog

## [v1.7.0](https://github.com/translation/angular/releases/tag/v1.7.0) (2023-07-07)
 
#### Fixes (bugs & defects):

 * Improve the rebuilding of target XLF files [#7](https://github.com/translation/angular/pull/7).

## [v1.6.0](https://github.com/translation/angular/releases/tag/v1.6.0) (2023-02-20)
 
#### Fixes (bugs & defects):

 * Don't write empty `<target>` in translated XLF, it prevented the fallback to source language to work as intended.

## [v1.5.0](https://github.com/translation/angular/releases/tag/v1.5.0) (2023-01-13)

#### New features:

 * Improve substitution for interpolations with complex expressions like `user.birthday | date:\'dd/MM/y\'`.
 
#### Fixes (bugs & defects):

 * Better node parsing if no `<source>` or `<target>` is found.

## [v1.4.0](https://github.com/translation/angular/releases/tag/v1.4.0) (2023-01-12)

#### New features:

 * Handle placeholders (named or unnamed) in components ([#5](https://github.com/translation/angular/pull/5)).
 
#### Fixes (bugs & defects):

 * Fix dependency issues.

## [v1.3.0](https://github.com/translation/angular/releases/tag/v1.3.0) (2023-01-10)

#### Fixes (bugs & defects):

 * Improve interpolation substitution to be more resilient to bad XLF formatting.

## [v1.2.0](https://github.com/translation/angular/releases/tag/v1.2.0) (2022-10-13)

#### New features:

 * Handle custom `source_file_path` and `target_files_path`.
 * Start by validating the configuration file with nice errors before Init/Sync.

## [v1.1.0](https://github.com/translation/angular/releases/tag/v1.1.0) (2022-09-30)

#### New features:

 * New `proxy` option can be added to `tio.config.json` file.

## [v1.0.1](https://github.com/translation/angular/releases/tag/v1.0.1) (2022-09-29)

#### New features:

 * Requests now send `client` (angular) and `version` of the package, to be able to manage deprecated versions server-side.

## [v1.0.0](https://github.com/translation/angular/releases/tag/v1.0.0) (2022-09-26)

#### New features:

 * First working complete version of this package.

