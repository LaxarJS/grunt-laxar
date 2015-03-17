/**
 * Copyright 2014 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
module.exports = function( grunt ) {
   'use strict';

   var path = require( 'path' );
   var q = require( 'q' );
   var async = require( 'async' );

   // Injected into the WidgetCollector, this uses grunt to read the file
   // and returns the expected { data: }-object
   function httpClient() {
      return {
         get: function( url ) {
            var deferred = q.defer();
            process.nextTick( function() {
               grunt.verbose.writeln( 'Portal Angular dependencies: reading "' + url + '"' );
               deferred.resolve( { data: grunt.file.readJSON( url ) } );
            } );
            return deferred.promise;
         }
      };
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function generateBootstrapCode( dependenciesByTechnology ) {

      var dependencies = [];
      var registryEntries = [];
      Object.keys( dependenciesByTechnology )
         .reduce( function( start, technology ) {
            var end = start + dependenciesByTechnology[ technology].length;
            [].push.apply( dependencies, dependenciesByTechnology[ technology ] );
            registryEntries.push( '\'' + technology + '\': modules.slice( ' + start + ',' + end + ' )' );
            return end;
         }, 0 );

      var requireString = '[\n   \'' + dependencies.join( '\',\n   \'' ) + '\'\n]';

      return 'define( ' + requireString + ', function() {\n' +
         '   \'use strict\';\n' +
         '\n' +
         '   var modules = [].slice.call( arguments );\n' +
         '   return {\n' +
         '      ' + registryEntries.join( ',\n      ' ) + '\n' +
         '   };\n' +
         '} );\n';
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function pushAllIfNotExists( arr, values ) {
      values.forEach( function( value ) {
         if( arr.indexOf( value ) === -1 ) {
            arr.push( value );
         }
      } );
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   grunt.registerMultiTask( 'portal_angular_dependencies',
      'Generate a RequireJS module to bootstrap Angular.',
      function() {

         var options = this.options( {
            base: '.',
            laxar: 'laxar',
            pages: 'laxar-path-pages',
            widgets: 'laxar-path-widgets',
            requireConfig: 'require_config.js'
         } );
         var files = this.files;
         var done = this.async();

         var config = require( '../lib/require_config' )( options.requireConfig, options );
         var requirejs = require( 'requirejs' ).config( config );
         var paths = require( '../lib/laxar_paths' )( config, options );

         grunt.verbose.writeln( 'Portal Angular dependencies: loading page loader' );
         var PageLoader = requirejs( 'laxar/lib/portal/portal_assembler/page_loader' );
         var WidgetCollector = require( '../lib/widget_collector' );

         var client = httpClient();

         grunt.verbose.writeln( 'Portal Angular dependencies: page loader' );
         var pageLoader = PageLoader.create( q, client, paths.PAGES );

         grunt.verbose.writeln( 'Portal Angular dependencies: initializing widget collector' );
         var widgetCollector = WidgetCollector.create(
            client,
            path.relative( config.baseUrl, paths.WIDGETS ),
            pageLoader
         );

         async.each( files, function( file, done ) {

            grunt.verbose.writeln( 'Portal Angular dependencies: ' + file.dest );

            var promises = file.src.map( function( flow ) {
               return widgetCollector.gatherWidgetsAndControls( paths.WIDGETS, flow );
            } );

            q.all( promises )
               .then( function( results ) {
                  var bucket = { angular: [] };
                  results.forEach( function( result ) {
                     if( Array.isArray( result.controls ) ) {
                        pushAllIfNotExists( bucket.angular, result.controls );
                     }

                     Object.keys( result.widgets ).forEach( function( type ) {
                        if( !Array.isArray( bucket[ type ] ) ) {
                           bucket[ type ] = [];
                        }

                        pushAllIfNotExists( bucket[ type ], result.widgets[ type ] );
                     } );
                  } );

                  return bucket;
               } )
               .then( function( moduleData ) {
                  grunt.file.write( file.dest, generateBootstrapCode( moduleData ) );
                  grunt.log.ok( 'Created Angular dependencies in "' + file.dest + '".' );
                  done();
               } )
               .catch( grunt.fail.fatal );
         }, done );
      } );
};
