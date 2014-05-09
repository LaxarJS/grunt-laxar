/**
 * Copyright 2014 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
module.exports = function( grunt ) {
   'use strict';

   var path = require( 'path' );
   var _ = grunt.util._;

   grunt.task.registerMultiTask( 'widget_json_merger', 'Merges multiple widget.json files into one file', function() {

      var options = this.options( {
         base: '.',
         widgets: 'laxar-path-widgets',
         output: 'var/static',
         requireConfig: 'require_config.js'
      } );

      var config = require( '../lib/require_config' )( options.requireConfig, options );
      var paths = require( '../lib/laxar_paths' )( config, options );
      var output = options.output + '/widgets.js';

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      var allWidgetSpecifications = {};

      grunt.file.expand( paths.WIDGETS +  '/*/*/widget.json' ).forEach( function( widgetJson ) {
         var name = widgetJson.replace( '/widget.json', '' ).replace( paths.WIDGETS + '/', '' );
         var widgetSpecification = grunt.file.readJSON( widgetJson );
         allWidgetSpecifications[ name ] = removeDescriptions( widgetSpecification );
      } );

      grunt.file.write( output, 'define(' + JSON.stringify( allWidgetSpecifications ) + ');' );
      grunt.log.ok( 'Created merged widget.json file in "' + output + '".' );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      function removeDescriptions( obj ) {
         if( obj == null || typeof obj !== 'object' ) { return obj; }

         var result = _.isArray( obj ) ? [] : {};
         _.each( obj, function( value, key ) {
            if( !( key === 'description' && typeof value === 'string' ) ) {
               result[ key ] = removeDescriptions( value );
            }
         } );
         return result;
      }

   } );
};
