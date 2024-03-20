# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.2.0] - 2024-03-20
### Added
- A `query.FindResult` class for detailed info (mostly for debugging).
- A `query.findWith()` method to use a `FindResult` instance with `find()`.
### Changed
- The `query.find()` method supports the newly added `FindResult` objects.
- Changed some jsdoc tags and shifted them around a bit.
### Fixed
- Some erroneous variable names in `query` module.

## [1.1.0] - 2024-03-18
### Added
- New `query` module with a `find()` function that supports several options.
- New `isQueryable()`, `guessHTML()`, and `getNested()` functions have been
  added to the `utils` module.
- An `elem()` function to the `parser` module.
- A top-level `ez` property that is actually just an object with some short 
  aliases to commonly used functions in the other modules.
### Changed
- Moved `VALID_TAG` constant from `content` to `utils`.
  I left an exported alias in `content` so it works either way.
  There's also an identical alias in `parser` now as well.
- Removed `isArrayOfInstances()` method from `utils` in favour of a
  more flexible `isArrayOf()` method now in [@lumjs/core].

## [1.0.0] - 2024-03-14
### Added
- Initial release.

[Unreleased]: https://github.com/supernovus/lum.web-core.js/compare/v1.2.0...HEAD
[1.2.0]: https://github.com/supernovus/lum.web-core.js/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/supernovus/lum.web-core.js/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/supernovus/lum.web-core.js/releases/tag/v1.0.0

[@lumjs/core]: https://github.com/supernovus/lum.core.js
