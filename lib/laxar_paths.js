/**
 * Copyright 2014 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
var requirejs = require( 'requirejs' );

/**
 * Use laxar and the given require configuration to resolve
 * the paths/constants that laxar uses.
 *
 * @param {Object} config
 *    the require configuration to use
 * @param {Object} [options]
 *    overrides
 *
 * @return {Object}
 *    an object containig the path laxar constants `PRODUCT`,
 *    `THEMES`, `LAYOUTS`, `WIDGETS`, `PAGES`, `FLOW_JSON`,
 *    `DEFAULT_THEME`.
 */
module.exports = function laxarPaths( config, options ) {
   'use strict';

   options = options || {};
   var req = requirejs.config( config );

   return {
      PRODUCT: req.toUrl( options.base || options.root || 'laxar-path-root' ),
      THEMES: req.toUrl( options.themes || 'laxar-path-themes' ),
      LAYOUTS: req.toUrl( options.layouts || 'laxar-path-layouts' ),
      WIDGETS: req.toUrl( options.widgets || 'laxar-path-widgets' ),
      PAGES: req.toUrl( options.pages || 'laxar-path-pages' ),
      FLOW_JSON: req.toUrl( options.flow || 'laxar-path-flow' ),
      DEFAULT_THEME: req.toUrl( options.defaultTheme || 'laxar_uikit/themes/default.theme' )
   };

};
