/**
 * Copyright 2015 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
module.exports = function( grunt ) {
   'use strict';

   var path = require( 'path' );
   var q = require( 'q' );
   var async = require( 'async' );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   grunt.registerMultiTask( 'laxar_application_dependencies',
      'Generate a RequireJS module to bootstrap a LaxarJS application with its widget modules.',
      function() {

         var options = this.options( {
            base: '.',
            applicationPackage: 'laxar-application',
            laxar: 'laxar',
            pages: 'laxar-path-pages',
            controls: 'laxar-path-controls',
            widgets: 'laxar-path-widgets',
            requireConfig: 'require_config.js'
         } );
         var files = this.files;
         var done = this.async();

         var config = require( '../lib/require_config' )( options.requireConfig, options );
         var requirejs = require( 'requirejs' ).config( config );
         grunt.verbose.writeln( 'laxar_application_dependencies: obtaining page loader from LaxarJS core' );
         var PageLoader = requirejs( 'laxar/lib/loaders/page_loader' );
         var WidgetCollector = require( '../lib/widget_collector' );
         var paths = require( '../lib/laxar_paths' )( config, options );

         grunt.verbose.writeln( 'laxar_application_dependencies: instantiating page loader' );
         var pageLoader = PageLoader.create( q, httpClient(), path.resolve( paths.PAGES ) );

         grunt.verbose.writeln( 'laxar_application_dependencies: instantiating widget collector' );
         var widgetCollector = WidgetCollector.create(
            requirejs,
            path.join( options.applicationPackage, path.relative( options.base, paths.WIDGETS ) ),
            pageLoader
         );

         async.each( files, function( file, done ) {

            grunt.verbose.writeln( 'laxar_application_dependencies: ' + file.dest );

            var promises = file.src.map( function( flow ) {
               return widgetCollector.gatherWidgetsAndControls( paths.WIDGETS, flow );
            } );

            q.all( promises )
               .then( function( results ) {
                  var bucket = { angular: [] };
                  results.forEach( function( result ) {
                     ( result.controls || [] ).forEach( function( controlPath ) {
                        var descriptor = result.descriptorForControl( controlPath );

                        pushArtifact( bucket, determineArtifactTechnology( descriptor ), controlPath );
                     } );

                     ( result.widgets || [] ).forEach( function( widgetPath ) {
                        var descriptor = result.descriptorForWidget( widgetPath );

                        pushArtifact( bucket, determineArtifactTechnology( descriptor ), widgetPath );
                     } );
                  } );

                  return bucket;
               } )
               .then( function( moduleData ) {
                  grunt.file.write( file.dest, generateBootstrapCode( moduleData ) );
                  grunt.log.ok( 'Collected LaxarJS application dependencies in "' + file.dest + '".' );
                  done();
               } )
               .catch( done );
         }, done );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         function determineArtifactTechnology( specification ) {
            if( !specification.integration || !( 'technology' in specification.integration ) ) {
               return 'angular';
            }

            return specification.integration.technology;
         }

      } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   // Injected as http client mock into the page loader
   function httpClient() {
      return {
         get: function( url ) {
            return q.nfcall( process.nextTick )
               .then( function() {
                  grunt.verbose.writeln( 'laxar_application_dependencies: reading "' + url + '"' );
                  if( grunt.file.exists( url ) ) {
                     return { data: grunt.file.readJSON( url ) };
                  }

                  throw new Error( 'Could not load ' + url );
               } );
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
            registryEntries.push( '\'' + technology + '\': modules.slice( ' + start + ', ' + end + ' )' );
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

   function pushArtifact( bucket, technology, value ) {
      if( !Array.isArray( bucket[ technology ] ) ) {
         bucket[ technology ] = [];
      }
      if( bucket[ technology ].indexOf( value ) === -1 ) {
         bucket[ technology ].push( value );
      }
   }

};
