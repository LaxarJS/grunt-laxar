/**
 * Copyright 2015 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
module.exports = function( grunt ) {
   'use strict';

   var path = require( '../lib/path-platform/path' ).posix;

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   grunt.registerTask( 'laxar-test', [
      'laxar-build',
      'laxar-test-configure-flow',
      'connect:laxar-test',
      'laxar-test-widget-internal',
      'laxar-test-merge-results'
   ] );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   grunt.registerMultiTask( 'laxar-test-flow',
      'Tests LaxarJS application artifacts',
      function() {
         var target = this.nameArgs.split( ':' )[ 1 ];
         var options = this.options( {
            tasks: [
               'laxar-test-configure-flow:' + target,
               'connect:laxar-test',
               'laxar-test-widget-internal',
               'laxar-test-merge-results'
            ]
         } );

         grunt.task.run( options.tasks );
         grunt.task.run( options.userTasks.map( function( taskName ) {
            return taskName + ':' + target;
         } ) );
      }
   );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   grunt.registerMultiTask( 'laxar-test-merge-results', function() {
      var helpers = require( './lib/task_helpers' )( grunt, 'laxar-test-merge-results' );
      this.files.forEach( function( file ) {
         var startMs = new Date();
         helpers.writeIfChanged(
            file.dest,
            mergeTags( 'testsuites', file.src.map( grunt.file.read ) ),
            startMs
         );
      } );


      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      function extractTag( tagname, text ) {
         var pattern = new RegExp( '<[/]?' + tagname + '[^>]*>', 'm' );
         return text.split( pattern ).filter( function( _, index ) {
            // keep only the contents of the tag
            return (index % 2) === 1;
         } ).join( '' );
      }

      function mergeTags( tagname, texts ) {
         return [].concat(
            '<?xml version="1.0"?>\n<' + tagname + '>',
            texts.map( extractTag.bind( null, tagname ) ),
            '</' + tagname + '>\n'
         ).join( '' );
      }

   } );

};
