# lum.web-core.js

A small collection of basic fundamental functions and classes for web apps.

Just as [@lumjs/core] is the foundation upon which all of my `@lumjs/*` 
packages are built, `@lumjs/web-core` will become the foundation for 
all of my `@lumjs/web-*` pacakges.

## Related `@lumjs` packages

There are several packages that are either direct extensions of this one,
or are related to it in one way or another.

### Active/Current

* [web-core-extra] → An extension package to provide useful features
  that are outside the scope of the minimalistic `web-core` package.
  Currently includes a wrapper class. More to come later.

### Planned/In-development

* [web-tests] → A complimentary package for connecting the [@lumjs/tests]
  package to the `web-core` package, with _modular_ test environments, 
  including _optional_ [jsdom] support.

### Deprecated/Retired

* [@lumjs/dom] → My first attempt at a web-app foundation.
  This supported using [jsdom] directly on the server-side and due to
  several questinable design choices was entirely overkill for basic needs.
* [tests-dom] → A package extending [@lumjs/tests] to support the older 
  [@lumjs/dom] package. A lot of `web-tests` will be based on this, but
  re-written to work with `web-core` instead of `@lumjs/dom`.

### Other...

There's also an entire collection of `@lumjs/web-*` packages (most are still 
in planning, only a few are published) that will make writing web apps fun!
(I won't say _easy_, as nothing in web development is *ever* easy... 🤪)

And of course the rest of the `@lumjs/*` packages that aren't specifically
designed for use in web apps, but many of which work just fine in that
environment (generally if it isn't using _Node.js_ specific features, it
can be _compiled_ with your bundler of choice to use it in web apps.)

## Official URLs

This library can be found in two places:

 * [Github](https://github.com/supernovus/lum.web-core.js)
 * [NPM](https://www.npmjs.com/package/@lumjs/web-core)

## Author

Timothy Totten <2010@totten.ca>

## License

[MIT](https://spdx.org/licenses/MIT.html)


[jsdom]: https://github.com/jsdom/jsdom
[@lumjs/core]: https://github.com/supernovus/lum.core.js
[@lumjs/tests]: https://github.com/supernovus/lum.tests.js
[web-core-extra]: https://github.com/supernovus/lum.web-core-extra.js
[web-tests]: https://github.com/supernovus/lum.web-tests.js
[@lumjs/dom]: https://github.com/supernovus/lum.dom.js
[tests-dom]: https://github.com/supernovus/lum.tests-dom.js
