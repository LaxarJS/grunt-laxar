/**
 * Copyright 2014 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
module.exports = function( grunt ) {
   'use strict';

   var path = require( '../lib/path-platform/path' ).posix;
   var laxarDox = require( 'laxar-dox' );

   grunt.task.registerMultiTask( 'laxar-dox', 'Creates API documentation in Markdown', function() {
      runLaxarDox( this );
   } );

   // Alias for compatibility with grunt-laxar v1.0.0:
   grunt.task.registerMultiTask( 'laxar_dox', 'Creates API documentation in Markdown', function() {
      runLaxarDox( this );
   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function runLaxarDox( task ) {

      var files = task.files || [];

      files.forEach( function( file ) {
         grunt.log.ok( 'laxar-dox: creating markdown from ' + file.src.length + ' files.' );

         file.src.forEach( function( filePath ) {
            var markdown = laxarDox.createMarkdown( grunt.file.read( filePath ) );
            if( !markdown ) {
               // no public api doc comments found
               return;
            }

            var fileName = path.basename( filePath );
            var outputFilePath = path.join( file.dest, fileName + '.md' );

            grunt.file.write( outputFilePath, markdown );

            grunt.log.ok( 'Created "' + outputFilePath + '" from "' + filePath + '".' );
         } );
      } );

   }

};
