/**
 * Copyright 2015 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
module.exports = function( grunt ) {
   'use strict';

   var TASK = 'laxar-test-configure-widget';

   var path = require( 'path' );
   var CONFIG_FILE = path.join( 'work', 'test-widget-configuration.json' );
   var RESULTS_FILE = path.join( 'tooling', 'test-results.xml' );
   var helpers = require( './lib/task_helpers' )( grunt, TASK );

   grunt.registerMultiTask( TASK,
      'Runs the spec tests for each widget within this flow.',
      function() { runTestConfigureWidgets( this ); }
   );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function runTestConfigureWidgets( task ) {

      var startMs = Date.now();

      var flowId = task.nameArgs.split( ':' )[ 1 ];
      var flowsDirectory = task.files[ 0 ].src[ 0 ];

      var options = task.options( {
         resultsFile: 'test-results.xml',
         saveConfig: true
      } );

      var artifacts = helpers.artifactsListing( flowsDirectory, flowId );

      var config = {
         widget: {},
         'laxar-test-merge-results': {}
      };
      var mergeConfig = config[ 'laxar-test-merge-results' ][ flowId ] = {
         src: [],
         dest: path.join( flowsDirectory, flowId, RESULTS_FILE )
      };

      artifacts.widgets.forEach( function( widgetInfo ) {
         var widgetPath = widgetInfo.path;
         var widgetResultsPath = path.join( widgetPath, options.resultsFile );
         config.widget[ widgetPath ] = {
            junitReporter: {
               outputFile: widgetResultsPath
            }
         };
         mergeConfig.src.push( widgetResultsPath );
      } );

      // Write generated configuration, for inspection:
      if( options.saveConfig ) {
         var destination = path.join( flowsDirectory, flowId , CONFIG_FILE );
         var result = JSON.stringify( config, null, 3 );
         helpers.writeIfChanged( destination, result, startMs );
      }

      // Apply generated configuration:
      Object.keys( config.widget ).forEach( function( target ) {
         grunt.config( 'widget.' + target, config.widget[ target ] );
      } );
      grunt.config( 'laxar-test-merge-results.' + flowId, mergeConfig );
   }

};
