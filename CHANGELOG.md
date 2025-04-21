# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.7.2] - 2024-12-10 (commited 2025-04-21)
### Added
- ez.POS alias to content.POS
### Fixed
- Changelog links

## [1.7.1] - 2024-11-06
### Changed
- More tweaks to `ui.getTargetPos()` and `ui.reposition()`
### Added
- `ui.isTouchEvent` and `ui.isTouch` helper functions

## [1.7.0] - 2024-10-30
### Fixed
- The `ui.getTargetPos()` checks for `window.TouchEvent`,
  so browsers without it won't throw reference errors.
### Removed
- The `dialog` class (moved into `@lumjs/web-dialog` package).
  I'm not bumping the major version as I'm the only user so fuck it.

## [1.6.0] - 2024-10-18
### Added
- A simple `dialog` class
- `getTargetPos()`, `isPos()` and `reposition()` to `ui` module
### Changed
- Moved to using the @lumjs/build system.

## [1.5.1] - 2024-10-10
### Fixed
- A typo in `utils.empty()`
- A typo in `events.addDelegatedEvent()`
### Added
- `query.find.with()` is an alias to `query.findWith()`

## [1.5.0] - 2024-08-20
### Added
- `events.onEvents()` a wrapper around `events.onEvent()`
  that allows working with multiple Elements or event names at once.
- `ez.on()` → `events.onEvent()`
- `ez.listen()` → `events.onEvents()`
### Changed
- Enhanced the documentation for the `events` module.

## [1.4.0] - 2024-04-22
### Changed
- Moved `utils.getSymbolMap` to `@lumjs/core/maps.getSymbolMap`
  - Left an _alias_ in place so existing imports will continue to work.
  - Added an alias for the new `@lumjs/core/maps.getSymbolCache` function.
- Bumped min version of `@lumjs/core` to reflect the above changes.
- Fixed some DocBlocks in `query` sub-module.

## [1.3.0] - 2024-03-26
### Added
- A `utils.empty()` function for emptying different kinds of containers.
- A new `ui` module for UI related functions.
  - `ui.opacityOf()` to get the opacity value of an element.
- A couple new aliases to the `ez` object:
  - `empty()` → `utils.empty()`
  - `ready()` → `utils.whenDOMReady()`

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

[Unreleased]: https://github.com/supernovus/lum.web-core.js/compare/v1.7.2...HEAD
[1.7.2]: https://github.com/supernovus/lum.web-core.js/compare/v1.7.1...v1.7.2
[1.7.1]: https://github.com/supernovus/lum.web-core.js/compare/v1.7.0...v1.7.1
[1.7.0]: https://github.com/supernovus/lum.web-core.js/compare/v1.6.0...v1.7.0
[1.6.0]: https://github.com/supernovus/lum.web-core.js/compare/v1.5.1...v1.6.0
[1.5.1]: https://github.com/supernovus/lum.web-core.js/compare/v1.5.0...v1.5.1
[1.5.0]: https://github.com/supernovus/lum.web-core.js/compare/v1.4.0...v1.5.0
[1.4.0]: https://github.com/supernovus/lum.web-core.js/compare/v1.3.0...v1.4.0
[1.3.0]: https://github.com/supernovus/lum.web-core.js/compare/v1.2.0...v1.3.0
[1.2.0]: https://github.com/supernovus/lum.web-core.js/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/supernovus/lum.web-core.js/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/supernovus/lum.web-core.js/releases/tag/v1.0.0

[@lumjs/core]: https://github.com/supernovus/lum.core.js
