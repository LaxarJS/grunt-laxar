/**
 * Copyright 2015 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
module.exports = function( grunt ) {
   'use strict';

   var TASK = 'laxar-dist-js';

   var path = require( '../lib/path-platform/path' ).posix;
   var CONFIG_FILE = path.join( 'work', 'dist-js-configuration.json' );
   var CONCAT_RESULT_REF = 'work/require-configured';
   var REQUIREJS_RESULT = 'dist/bundle.js';
   var REQUIRE_CONFIG = 'require_config';

   var load = require( './lib/load' );
   load( grunt, 'grunt-contrib-concat' );
   load( grunt, 'grunt-contrib-requirejs' );

   var helpers = require( './lib/task_helpers' )( grunt, TASK );

   grunt.registerMultiTask( TASK,
      'Combines AMD modules of flow artifacts using r.js, to provide a concatenated, optimized version.',
      function() { runDistJs( this ); }
   );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function runDistJs( task ) {
      var base = task.options( { 'base': '.' } ).base;
      var requirejsHelper = require( '../lib/require_config' ).helper( base );


      var startMs = Date.now();

      var flowsDirectory = task.files[ 0 ].src[ 0 ];
      var flowId = task.nameArgs.split( ':' )[ 1 ];
      var subTask = 'laxar-flow-' + flowId;

      // Path to the merged require (with widget and control local config) configuration for this flow
      var generatedRequireConfigPath = path.join( flowsDirectory, flowId, REQUIRE_CONFIG ) + '.js';

      // The pre-configured requirejs implementation is stored here:
      var requirePlusConfigPath = path.join( flowsDirectory, flowId, CONCAT_RESULT_REF ) + '.js';
      var requirePlusConfigRef = requirejsHelper
         .projectRef( path.join( 'laxar-application', flowsDirectory, flowId, CONCAT_RESULT_REF ) );

      var options = task.options( {

         // flow-specific overrides
         flow: {},

         baseUrl: 'bower_components/',

         // concat, requirejs: file that sets `var require = ...`
         mainConfigFile: generatedRequireConfigPath,

         // requirejs: name of the init-file, relative to the RequireJS baseUrl
         name: '../init',
         // requirejs: optimization level
         optimize: 'uglify2',
         // requirejs: make sure to include RequireJS + configuration
         deps: [ requirePlusConfigRef ],
         // requirejs: where to put the end results
         out: path.join( flowsDirectory, flowId, REQUIREJS_RESULT ),

         saveConfig: true,
         tasks: [
            'concat:' + subTask,
            'requirejs:' + subTask
         ]
      } );

      // apply flow settings:
      options.name = options.flow.init || options.name;

      // A bit hacky: Insert a fixup-statement to make sure that the correct flow will be loaded.
      var flowFixupStatement = 'require.paths[ \'laxar-path-flow\' ] = ' +
         '"' + path.join( '..', options.flow.src ) + '";\n';
      // Another fixup statement to allow overriding of the RequireJS baseUrl
      var baseUrlFixupStatement = 'require.baseUrl = ' +
         '(typeof window !== "undefined" && window.laxar && window.laxar.amd && window.laxar.amd.baseUrl)' +
         ' || require.baseUrl;\n';

      var config = {
         concat: {},
         requirejs: {}
      };
      config.concat[ subTask ] = {
         options: {
            separator: flowFixupStatement + baseUrlFixupStatement
         },
         src: [
            generatedRequireConfigPath,
            requirejsHelper.projectPath( 'requirejs' ) + '.js'
         ],
         dest: requirePlusConfigPath
      };
      config.requirejs[ subTask ] = {
         options: options
      };

      if( options.saveConfig ) {
         var destination = path.join( flowsDirectory, flowId, CONFIG_FILE );
         var result = JSON.stringify( config, null, 3 );
         helpers.writeIfChanged( destination, result, startMs );
      }

      grunt.config( 'concat.' + subTask, config.concat[ subTask ] );
      grunt.config( 'requirejs.' + subTask, config.requirejs[ subTask ] );

      if( options.tasks ) {
         grunt.task.run( options.tasks );
      }

   }

};
