/**
 * Copyright 2015 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
module.exports = function( grunt ) {
   'use strict';

   var TASK = 'laxar-merge-require-config';

   var fs = require( 'fs' );
   var q = require( 'q' );
   var path = require( 'path' );
   var helpers = require( './lib/task_helpers' )( grunt, TASK );


   var requireConfigMerger = require( '../lib/require_config_merger' );

   grunt.registerMultiTask( TASK,
      'Merges configuration for RequireJS found within artifacts reachable from the current flow.',
      function() { runMergeRequireConfigFlow( this ); }
   );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function runMergeRequireConfigFlow( task ) {
      var done = task.async();

      var options = task.options( { base: '.' } );

      var startMs = Date.now();
      var flowId = task.nameArgs.split( ':' )[ 1 ];
      var flowsDirectory = task.files[ 0 ].src[ 0 ];

      var merger = requireConfigMerger.create( grunt.log );

      var artifacts = helpers.artifactsListing( flowsDirectory, flowId );
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
            var outFile = path.join( flowsDirectory, flowId, requireConfigMerger.REQUIRE_CONFIG_NAME );
            helpers.writeIfChanged( outFile, requireConfigCode, startMs );
         } )
         .then( done, function( err ) {
            grunt.log.error( TASK + ': ERROR:', err );
            done( err );
         } );
   }

};
