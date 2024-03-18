/**
 * Core library for use in web browser (HTML DOM) environments.
 * @module @lumjs/web-core
 */

"use strict";

const core = require('@lumjs/core');
const {lazy} = core.types;

/**
 * Functions for adding content to elements.
 * @name module:@lumjs/web-core.content
 * @see module:@lumjs/web-core/content
 */

/**
 * Functions for registering event handlers.
 * @name module:@lumjs/web-core.events
 * @see module:@lumjs/web-core/events
 */

/**
 * Functions for parsing HTML and XML.
 * @name module:@lumjs/web-core.parser
 * @see module:@lumjs/web-core/parser
 */

/**
 * Simple query helper.
 * @name module:@lumjs/web-core.query
 * @see module:@lumjs/web-core/query
 */

/**
 * Various utility functions.
 * @name module:@lumjs/web-core.utils
 * @see module:@lumjs/web-core/utils
 */

exports = module.exports =
{
  content: require('./content'),
  events:  require('./events'),
  parser:  require('./parser'),
  query:   require('./query'),
  utils:   require('./utils'),
}

/**
 * Run a function when the DOM is ready.
 * 
 * @alias module:@lumjs/web-core.whenReady
 * @see module:@lumjs/web-core/utils.whenDOMReady
 */
exports.whenReady = exports.utils.whenDOMReady;

/**
 * Functions for building and triggering DOM events (lazy-loaded).
 * @name module:@lumjs/web-core.eventbuilder
 * @see module:@lumjs/web-core/eventbuilder
 */

/**
 * A way to build DOM lists with no constructors (lazy-loaded).
 * @name module:@lumjs/web-core.listcompiler
 * @see module:@lumjs/web-core/listcompiler
 */

lazy(exports, 'eventbuilder', () => require('./eventbuilder'));
lazy(exports, 'listcompiler', () => require('./listcompiler'));

/**
 * A few short aliases to various functions in one place.
 * @alias module:@lumjs/web-core.ez
 * @type {object}
 * @prop {function} add {@link module:@lumjs/web-core/content.addContent}
 * @prop {function} elem {@link module:@lumjs/web-core/parser.elem}
 * @prop {function} find {@link module:@lumjs/web-core/query.find}
 * @prop {function} nested {@link module:@lumjs/web-core/utils.getNested}
 * @prop {function} collection {@link module:@lumjs/web-core/utils.isCollection}
 * @prop {function} queryable {@link module:@lumjs/web-core/utils.isQueryable}
 */
const shortcuts =
{
  add: exports.content.addContent,
  elem: exports.parser.elem,
  find: exports.query.find,
  nested: exports.utils.getNested,
  collection: exports.utils.isCollection,
  queryable: exports.utils.isQueryable,
}

exports.ez = shortcuts;