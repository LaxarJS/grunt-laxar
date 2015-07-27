/**
 * Copyright 2015 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
module.exports = function( grunt ) {
   'use strict';

   var TASK = 'laxar-configure';

   var ARTIFACTS_TASK = [ 'laxar-artifacts' ];

   var STAGES = [ 'build-flow', 'dist-flow', 'test-flow' ];

   // These multi-tasks will be auto-configured for each flow target.
   var BASE_TASKS = {
      'build-flow': [
         'laxar-merge-require-config',
         'laxar-resources',
         'laxar-dependencies',
         'laxar-configure-watch'
      ],
      'dist-flow': [
         'laxar-dist-css',
         'laxar-dist-js'
      ],
      'test-flow': [
         'laxar-test-configure-flow'
      ]
   };

   var helpers = require( './lib/task_helpers' )( grunt, TASK );
   var path = require( 'path' );

   var RESULT_FILE = path.join( 'work', 'task-configuration.json' );

   grunt.registerTask( TASK,
      'Configures LaxarJS tasks for development, testing and optimization.',
      function() { runConfigure( this ); }
   );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function runConfigure( task ) {
      var options = task.options( {
         workDirectory: path.join( 'var', 'flows' ),
         testDirectory: path.join( 'var', 'tests' ),
         ports: {
            develop: 8000,
            test: 9000,
            livereload: 35729
         },
         flows: [],
         userTasks: {
            'build-flow': [],
            'dist-flow': []
         },
         saveConfig: true
      } );

      if( grunt.option( 'laxar-flow' ) ) {
         var flow = grunt.option( 'laxar-flow' );
         options.flows = options.flows.filter( function( flowConfig ) {
            return flowConfig.target === flow;
         } );
      }

      var flowsDirectory = options.workDirectory;
      configureFlowTasks( options, flowsDirectory );
      configureOtherTasks( options );
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function configureFlowTasks( options, flowsDirectory ) {

      var startMs = Date.now();

      options.flows.forEach( function( flowSettings ) {

         var flowId = flowSettings.target;
         var flowSource = flowSettings.src;

         var config = {};
         // special-case multi-task (this one requires a source)
         config[ ARTIFACTS_TASK ] = {};
         config[ ARTIFACTS_TASK ][ flowId ] = {
            src: flowSource,
            dest: flowsDirectory
         };

         STAGES.forEach( function( stage ) {
            var userTasks = ( options.userTasks && options.userTasks[ stage ] ) || [];
            var stageTasks = [ 'laxar-' + stage ].concat( BASE_TASKS[ stage ] ).concat( userTasks );

            config[ 'laxar-' + stage ] = {
               options: { userTasks: userTasks }
            };
            stageTasks.forEach( function( taskName ) {
               config[ taskName ] = config[ taskName ] || {};
               config[ taskName ][ flowId ] = {
                  src: flowsDirectory,
                  options: {
                     flow: flowSettings,
                     testDirectory: options.testDirectory
                  }
               };
            } );
         } );

         // save generated configuration for inspection:
         if( options.saveConfig ) {
            var destination = path.join( flowsDirectory, flowId, RESULT_FILE );
            var result = JSON.stringify( config, null, 3 );
            helpers.writeIfChanged( destination, result, startMs );
         }

         // activate the generated configuration for flow targets (and options):
         Object.keys( config ).forEach( function( taskName ) {
            var taskConfig = config[ taskName ];
            Object.keys( taskConfig ).forEach( function( flowId ) {
               grunt.config( taskName + '.' + flowId, taskConfig[ flowId ] );
            } );
         } );

      } );

   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function configureOtherTasks( options ) {
      grunt.config( 'connect.laxar-develop.options.port', options.ports.develop );
      grunt.config( 'connect.laxar-test.options.port', options.ports.test );
      grunt.config( 'connect.options.livereload', options.ports.livereload );
      grunt.config( 'watch.options.livereload', options.ports.livereload );
      grunt.config( 'karma.options.proxies./base', 'http://localhost:' + options.ports.test );
      grunt.config( 'laxar-test-widget.options.testDirectory', options.testDirectory );
   }

};
