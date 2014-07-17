/**
 * Copyright 2014 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
module.exports = function( grunt ) {
   'use strict';

   var xcors = require( 'connect-xcors' );
   var load = require( './lib/load' );
   var _ = grunt.util._;

   var options = grunt.config( 'connect.options' ) || {};
   var livereload = options.livereload || grunt.config( 'watch.options.livereload' ) || true;

   grunt.config( 'watch.options.livereload', livereload );
   grunt.config( 'connect.options', _.defaults( {
      middleware: function( connect, options, middlewares ) {
         var directory = options.directory || options.base[options.base.length - 1];
         // IMPORTANT: Don't touch the order in which the middleware modules are loaded unless you really
         // know what you're doing. Otherwise things like setting CORS headers might break.
         return [
            xcors( {} ),

            // (#11) overwriting the directory configuration from grunt-contrib-connect with better options
            connect.directory(directory, { view: 'details', icons: true } )
         ].concat( middlewares );
      }
   }, options, {
      hostname: '*',
      port: 8000,
      livereload: livereload
   } ) );

   load( grunt, 'grunt-contrib-connect' );
};
