"use strict";

const core = require('@lumjs/core');
const {lazy} = core.types;
const utils = require('./utils');

/**
 * Core library for use in web browser (HTML DOM) environments.
 * 
 * This default export provides easy access to all sub-modules as
 * named properties, as well as a few common functions.
 * 
 * The `eventbuilder` and `listcompiler` properties are lazy-loaded.
 * 
 * @module @lumjs/web-core
 * @borrows module:@lumjs/web-core/utils.whenDOMReady as whenReady
 */
exports = module.exports =
{
  /**
   * Functions for adding content to elements
   * @alias module:@lumjs/web-core.content
   * @see module:@lumjs/web-core/content
   */
  content: require('./content'),
  /**
   * Functions for registering event handlers
   * @alias module:@lumjs/web-core.events
   * @see module:@lumjs/web-core/events
   */
  events:  require('./events'),
  /**
   * Functions for parsing HTML and XML
   * @alias module:@lumjs/web-core.parser
   * @see module:@lumjs/web-core/parser
   */
  parser:  require('./parser'),
  /**
   * Simple query helper
   * @alias module:@lumjs/web-core.query
   * @see module:@lumjs/web-core/query
   */
  query:   require('./query'),
  /**
   * UI related functions
   * @alias module:@lumjs/web-core.ui
   * @see module:@lumjs/web-core/ui
   */
  ui:      require('./ui'),
  /**
   * Various utility functions
   * @alias module:@lumjs/web-core.utils
   * @see module:@lumjs/web-core/utils
   */
  utils,

  whenReady: utils.whenDOMReady,
}

/**
 * Functions for building and triggering DOM events (lazy-loaded)
 * @name module:@lumjs/web-core.eventbuilder
 * @see module:@lumjs/web-core/eventbuilder
 */
lazy(exports, 'eventbuilder', () => require('./eventbuilder'));

/**
 * A way to build DOM lists with no constructors (lazy-loaded)
 * @name module:@lumjs/web-core.listcompiler
 * @see module:@lumjs/web-core/listcompiler
 */
lazy(exports, 'listcompiler', () => require('./listcompiler'));

/**
 * A few short aliases to various module functions in one place.
 * 
 * @namespace module:@lumjs/web-core.ez
 * 
 * @borrows module:@lumjs/web-core/content.addContent as add
 * @borrows module:@lumjs/web-core/parser.elem as elem
 * @borrows module:@lumjs/web-core/utils.empty as empty
 * @borrows module:@lumjs/web-core/query.find as find
 * @borrows module:@lumjs/web-core/events.onEvents as listen
 * @borrows module:@lumjs/web-core/utils.getNested as nested
 * @borrows module:@lumjs/web-core/events.onEvent as on
 * @borrows module:@lumjs/web-core/utils.whenDOMReady as ready
 * @borrows module:@lumjs/web-core/utils.isCollection as collection
 * @borrows module:@lumjs/web-core/utils.isQueryable as queryable
 * 
 */
const shortcuts =
{
  // Actions
  add:    exports.content.addContent,
  elem:   exports.parser.elem,
  empty:  utils.empty,
  find:   exports.query.find,
  listen: exports.events.onEvents,
  nested: utils.getNested,
  on:     exports.events.onEvent,
  POS:    exports.content.POS,
  ready:  utils.whenDOMReady,

  // Tests
  collection: utils.isCollection,
  queryable:  utils.isQueryable,
}

exports.ez = shortcuts;
