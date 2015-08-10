/**
 * Copyright 2015 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
module.exports = function( grunt ) {
   'use strict';

   var TASK = 'laxar-test-widget';

   var _ = require( 'lodash' );
   var fs = require( 'fs' );
   var q = require( 'q' );
   var path = require( '../lib/path-platform/path' ).posix;
   var artifactsCollector = require( '../lib/artifact_collector' );
   var requireConfigMerger = require( '../lib/require_config_merger' );
   var requirejsConfig = require( '../lib/require_config' );
   var helpers = require( './lib/task_helpers' )( grunt, TASK );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   /** This is *not* a flow target. Runs spec for a single widget. */
   grunt.registerTask( 'laxar-test-widget',
      'Configures and runs the spec-test for a single widget',
      function() {
         var target = this.nameArgs.split( ':' )[ 1 ];
         var options = this.options( {
            base: '.',
            testDirectory: path.join( 'var', 'test' )
         } );
         grunt.config( 'laxar-test-widget-internal.options.testDirectory', options.testDirectory );
         grunt.config( 'laxar-test-widget-internal.' + target, {} );

         var tasks = [
            'laxar-configure',
            'connect:laxar-test',
            'laxar-test-widget-internal:' + target
         ];

         grunt.task.run( tasks );
      }
   );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   /** This is *not* a flow target. Runs spec for a single widget. */
   grunt.registerMultiTask( 'laxar-test-widget-internal',
      'Runs the spec-test for a single widget',
      function() {

         var done = this.async();
         var options = this.options( { base: '.' } );
         var taskData = this.data || {};

         var requirejsHelper = requirejsConfig.helper( options.base );
         var pagesPath = requirejsHelper.projectPath( 'laxar-path-pages' );
         var widgetsPath = requirejsHelper.projectPath( 'laxar-path-widgets' );
         var target = this.nameArgs.split( ':' )[ 1 ];

         var fileContents = {
            'flow.json': { places: { entry: { page: 'page' } } }
         };
         fileContents[ path.join( pagesPath, 'page.json' ) ] = {
            areas: { content: [ { widget: path.relative( widgetsPath, target ) } ] }
         };

         var collector = artifactsCollector.create( grunt.log, {
            fileContents: fileContents
         } );

         var testPath = path.join( options.testDirectory, target );
         var merger = requireConfigMerger.create( grunt.log );
         collector.collectArtifacts( [ 'flow.json' ] )
            .then( function( artifacts ) {
               q.all( artifacts.controls.concat( artifacts.widgets )
                  .map( function( artifact ) {
                     var requirePath = path.join( artifact.path, requireConfigMerger.REQUIRE_CONFIG_NAME );
                     return helpers.fileExists( requirePath )
                        .then( function( exists ) {
                           return exists ? [ artifact.path ] : [];
                        } );
                  } ) )
                  .then( helpers.flatten )
                  .then( function( artifactDirs ) {
                     return merger.merge( [ options.base ].concat( artifactDirs ) );
                  } )
                  .then( function( requireConfigCode ) {
                     var outFile = path.join( testPath, requireConfigMerger.REQUIRE_CONFIG_NAME );
                     grunt.file.write( outFile, requireConfigCode );
                  } )
                  .then( function() {
                     var config = widgetConfiguration( target, testPath, options, taskData );

                     /* if the spec_runner.js does not exist, remove the karma task */
                     if( !grunt.file.exists( config.karma.options.laxar.specRunner ) ) {
                        grunt.log.warn( 'Widget \'' + target + '\' has no spec_runner.js!' );
                        delete config.karma;
                     }

                     for( var task in config ) {
                        if( config.hasOwnProperty( task ) ) {
                           var key = task + '.' + target;
                           grunt.config( key, _.defaults( {}, grunt.config( key ), config[ task ] ) );
                        }
                     }

                     var tasks = Object.keys( config );

                     grunt.log.ok( 'Running ' + grunt.log.wordlist( tasks ) + ' for ' + target );
                     grunt.task.run( tasks.map( function( task ) {
                        return task + ':' + target;
                     } ) );
                  } )
                  .then( done, function( err ) {
                     grunt.log.error( TASK + ': ERROR:', err );
                     done( err );
                  } );
            } );


         // build require config

         // run karma
      }
   );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function widgetConfiguration( widgetPath, testPath, options, config ) {
      options = _.defaults( options, {
         karma: {
            reporters: [ 'progress', 'junit' ],
            laxar: {
               specRunner: path.join( widgetPath, 'spec', 'spec_runner.js' ),
               requireConfig: path.join( testPath, requireConfigMerger.REQUIRE_CONFIG_NAME )
            },
            junitReporter: {
               outputFile: path.join( testPath, 'test-results.xml' ),
               suite: widgetPath.replace( /\//g, '.' )
            },
            coverageReporter: {
               type: 'lcovonly',
               dir: testPath,
               file: '../lcov.info'
            }
         },
         jshint: {}
      } );

      var allowedPaths = '!(bower_components|node_modules|var)';
      return {
         karma: _.defaults( {}, config.karma, {
            options: options.karma
         } ),
         jshint: _.defaults( {}, config.jshint, {
            options: options.jshint,
            src: [
               path.join( widgetPath, '*.js' ),
               path.join( widgetPath, allowedPaths, '*.js' ),
               path.join( widgetPath, allowedPaths, allowedPaths, '**', '*.js' )
            ]
         } )
      };
   }

};
