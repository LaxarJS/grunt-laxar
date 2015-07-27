/**
 * Copyright 2015 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
module.exports = function( grunt ) {
   'use strict';

   grunt.registerTask( 'laxar-build', [
      'laxar-configure',
      'laxar-build-flow'
   ] );

   /** This is basically an alias-task, but supports flow targets. */
   grunt.registerMultiTask( 'laxar-build-flow',
      'Rebuilds the artifacts model and associated files',
      function() {
         var flowId = this.nameArgs.split( ':' )[ 1 ];
         var options = this.options( {
            tasks: [
               'laxar-artifacts:' + flowId,
               'laxar-resources:' + flowId,
               'laxar-dependencies:' + flowId,
               'laxar-merge-require-config:' + flowId,
               'laxar-configure-watch:' + flowId
            ]
         } );
         grunt.task.run( options.tasks );

         if( options.userTasks ) {
            grunt.task.run( options.userTasks );
         }
      }
   );

};
