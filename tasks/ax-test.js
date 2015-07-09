/**
 * Copyright 2015 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
module.exports = function( grunt ) {
   'use strict';

   var path = require( 'path' );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   grunt.registerTask( 'laxar-test', [
      'laxar-build',
      'laxar-test-flow',
      'connect:laxar-test',
      'widget',
      'laxar-test-merge-results'
   ] );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   /** This is basically an alias-tasks, but handles multiple flow targets. */
   grunt.registerMultiTask( 'laxar-test-flow',
      'Tests LaxarJS application artifacts',
      function() {
         var target = this.nameArgs.split( ':' )[ 1 ];
         var options = this.options( {
            tasks: [
               'laxar-test-configure-widget:' + target
            ]
         } );

         grunt.task.run( options.tasks );
         if( options.userTasks ) {
            grunt.task.run( options.userTasks );
         }
      }
   );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   /** This is *not* a flow target. Runs spec for a single widget. */
   grunt.registerTask( 'laxar-test-widget',
      'Runs the spec-test for a single widget',
      function() {
         var target = this.nameArgs.split( ':' )[ 1 ];

         grunt.config( 'widget.' + target, {
            junitReporter: {
               outputFile: path.join( target, 'test-results.xml' )
            }
         } );

         var tasks = [
            'laxar-configure',
            'connect:laxar-test',
            'widget:' + target
         ];

         grunt.task.run( tasks );
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
   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

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

};
