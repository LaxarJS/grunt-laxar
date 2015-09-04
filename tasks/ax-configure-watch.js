/**
 * Copyright 2015 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
module.exports = function( grunt ) {
   'use strict';

   var TASK = 'laxar-configure-watch';

   var path = require( '../lib/path-platform/path' ).posix;
   var RESULT_FILE = path.join( 'work', 'watch-configuration.json' );

   var load = require( './lib/load' );
   load( grunt, 'grunt-contrib-watch' );

   var helpers = require( './lib/task_helpers' )( grunt, TASK );
   var flatten = helpers.flatten;
   var lookup = helpers.lookup;

   grunt.registerMultiTask( TASK,
      'Configures and watchers based on flow artifacts.',
       function() { runWatch( this ); }
   );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function runWatch( self ) {

      var startMs = Date.now();

      var flowId = self.nameArgs.split( ':' )[ 1 ];
      var flowsDirectory = self.files[ 0 ].src[ 0 ];
      var subTaskReload = flowId + '-reload';
      var subTaskRebuild = flowId + '-rebuild';
      var subTaskRequire = flowId + '-merge-require-config';
      var subTaskUpdate = flowId + '-update';

      var options = self.options( {
         spawn: false,
         saveConfig: true,
         watchBowerComponents: false
      } );

      var artifacts = helpers.artifactsListing( flowsDirectory, flowId );
      var config = { watch: {} };
      config.watch[ subTaskReload ] = watchConfigForReload( artifacts, flowId, options );
      config.watch[ subTaskUpdate ] = watchConfigForUpdate( artifacts, flowId, options );
      config.watch[ subTaskRebuild ] = watchConfigForRebuild( artifacts, flowId, options );
      config.watch[ subTaskRequire ] = watchConfigForRequireConfigMerging( artifacts, flowId, options );

      if( !options.watchBowerComponents ) {
         Object.keys( config.watch ).forEach( function( subTask ) {
            config.watch[ subTask].files = config.watch[ subTask].files.filter( function( patternEntry ) {
               return patternEntry.indexOf( 'bower_components' ) !== 0;
            } );
         } );
      }

      if( options.saveConfig ) {
         var destination = path.join( flowsDirectory, flowId, RESULT_FILE );
         var result = JSON.stringify( config, null, 3 );
         helpers.writeIfChanged( destination, result, startMs );
      }

      grunt.config( 'watch.' + subTaskReload, config.watch[ subTaskReload ] );
      grunt.config( 'watch.' + subTaskUpdate, config.watch[ subTaskUpdate ] );
      grunt.config( 'watch.' + subTaskRebuild, config.watch[ subTaskRebuild ] );
      grunt.config( 'watch.' + subTaskRequire, config.watch[ subTaskRequire ] );
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   /**
    * Changes detected by this watcher should
    *  - refresh the artifacts listing
    *  - reload the page
    */
   function watchConfigForRebuild( artifacts, flowId, options ) {
      return {
         files: flatten(
            selectArtifacts( artifacts, [ 'flows', 'pages' ] )
               .map( helpers.getResourcePaths( artifacts.themes, 'watch' ) )
         ),
         tasks: [ 'laxar-build:' + flowId ],
         options: { spawn: options.spawn }
      };
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   /**
    * Changes detected by this watcher should
    *  - reload the page
    */
   function watchConfigForReload( artifacts ) {
      return {
         files: flatten(
            selectArtifacts( artifacts )
               .map( helpers.getResourcePaths( artifacts.themes, 'watch' ) )
         ),
         event: [ 'changed' ]
      };
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   /**
    * Changes detected by this watcher should
    *  - merge changes from partial require config files with the global one
    */
   function watchConfigForRequireConfigMerging( artifacts, flowId, options ) {
      return {
         files: flatten(
            selectArtifacts( artifacts, [ 'widgets', 'controls' ] )
               .map( function( artifact ) {
                  return path.join( artifact.path, 'require_config.js' );
               } )
               .concat( 'require_config.js' )
         ),
         event: [ 'changed' ],
         tasks: [ 'laxar-merge-require-config:' + flowId ],
         options: { spawn: options.spawn }
      };
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   /**
    * Changes detected by this watcher should
    *  - update the resources
    *  - reload the page
    */
   function watchConfigForUpdate( artifacts, flowId, options ) {
      var config = watchConfigForReload( artifacts, flowId, options );
      config.files = unique( config.files.map( function( f ) {
         return f.replace( /[^\/\\]+$/, '*' );
      } ) );

      config.tasks = [ 'laxar-resources:' + flowId ];
      config.options = {
         event: [ 'added', 'deleted' ],
         spawn: options.spawn
      };
      return config;

      function unique( strings ) {
         var seen = {};
         return strings.filter( function( item ) {
            if( seen.hasOwnProperty( item ) ) {
               return false;
            }
            seen[ item ] = true;
            return true;
         } );
      }
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function selectArtifacts( artifacts, types ) {
      return helpers.flatten(
         ( types || Object.keys( artifacts ) ).map( lookup( artifacts ) )
      );
   }
};
