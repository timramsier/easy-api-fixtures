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

### Changed

* Output path is now set based on `path` string either in api object or general `output`
  ### Removed
* `versionInPath`, `endpointInPath`, and `aliasInPath` properties (now set by `path` string)

## [1.0.11] - 2018-02-26

### Added

* Add "changelog" documentation

### Changed

* Fix misspellings in README.md
