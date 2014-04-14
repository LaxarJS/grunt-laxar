/**
 * Copyright 2014 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
/*jshint node: true*/
module.exports = function( config, options ) {
   'use strict';

   var requirejs = require( 'requirejs' ).config( config );

   return {
      PRODUCT: requirejs.toUrl( options.base || options.root || 'laxar-path-root' ),
      THEMES: requirejs.toUrl( options.themes || 'laxar-path-themes' ),
      LAYOUTS: requirejs.toUrl( options.layouts || 'laxar-path-layouts' ),
      WIDGETS: requirejs.toUrl( options.widgets || 'laxar-path-widgets' ),
      PAGES: requirejs.toUrl( options.pages || 'laxar-path-pages' ),
      FLOW_JSON: requirejs.toUrl( options.flow || 'laxar-path-flow' ),
      DEFAULT_THEME: requirejs.toUrl( options.defaultTheme || 'laxar_uikit/themes/default.theme' )
   };

};
