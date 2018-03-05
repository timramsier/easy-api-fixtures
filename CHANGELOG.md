# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## Table of Contents

- [Changelog](#changelog)
  - [Table of Contents](#table-of-contents)
  - [[Unreleased]](#unreleased)
    - [Added](#added)
    - [Changed](#changed)
    - [Removed](#removed)
  - [[1.0.11] - 2018-02-26](#1011---2018-02-26)
    - [Added](#added)
    - [Changed](#changed)

## [Unreleased]

### Added

* `path` property on api objects (overwrites global `path` set in `output`)
* `getFilename` now rewrites the following in the filename
  * `?` to `_where_`
  * `&` to `_and`
  * `=` to `_equals_`
  * ` ` to `_`
* Added query params in slugs support
* added `requestFunction` configuration property that allows for the default http request library to be over written
* Added much better UI feedback

### Changed

* Output path is now set based on `path` string either in api object or general `output`
* Moved URL parsing to the utils.js file and wrote tests for it
  ### Removed
* `versionInPath`, `endpointInPath`, and `aliasInPath` properties (now set by `path` string)

## [1.0.11] - 2018-02-26

### Added

* Add "changelog" documentation

### Changed

* Fix misspellings in README.md
