/**
 * Copyright 2014 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
module.exports = function( grunt ) {
   'use strict';


   // There is no task here, instead we define a new option --continue.
   // Monkey-patch grunt to give a useful return code when --force is used.

   if( grunt.option( 'continue' ) ) {
      grunt.log.verbose.writeln( 'Using the force' );
      grunt.option( 'force', true );

      var exit = grunt.util.exit;
      grunt.util.exit = function( code ) {
         if( !code ) {
            exit( grunt.fail.warncount > 0 ? grunt.fail.code.TASK_FAILURE : 0 );
         } else {
            exit( code );
         }
      };
   }
};
