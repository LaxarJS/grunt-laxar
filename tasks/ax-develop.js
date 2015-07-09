/**
 * Copyright 2015 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
module.exports = function( grunt ) {
   'use strict';

   grunt.registerTask( 'laxar-develop', [
      'laxar-build',
      'connect:laxar-develop',
      'watch'
   ] );

   grunt.registerTask( 'laxar-develop-no-watch', [
      'laxar-build',
      'connect:laxar-develop:keepalive'
   ] );

};
