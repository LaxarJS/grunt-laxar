/**
 * Copyright 2015 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
module.exports = function( grunt ) {
   'use strict';

   grunt.registerTask( 'laxar-dist', [
      'laxar-build',
      'laxar-dist-flow'
   ] );

   /** This is basically an alias-task, but handles multiple flow targets. */
   grunt.registerMultiTask( 'laxar-dist-flow',
      'Optimizes LaxarJS application artifacts',
      function() {
         var target = this.nameArgs.split( ':' )[ 1 ];
         var options = this.options( {
            tasks: [
               'laxar-dist-css:' + target,
               'laxar-dist-js:' + target
            ]
         } );
         grunt.task.run( options.tasks );

         if( options.userTasks ) {
            grunt.task.run( options.userTasks.map( function( taskName ) {
               return taskName + ':' + target;
            } ) );
         }
      }
   );

};
