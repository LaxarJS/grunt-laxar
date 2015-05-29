/**
 * Copyright 2014 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
module.exports = function( grunt ) {
   'use strict';

   var path = require( 'path' );
   var laxarDox = require( 'laxar-dox' );

   grunt.task.registerMultiTask( 'laxar_dox', 'Creates API documentation in Markdown', function() {

      var options = this.options( {} );
      var files = this.files || [];

      files.forEach( function( file ) {
         grunt.log.ok( 'Laxar Dox: creating markdown from ' + file.src.length + ' files.' );

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
   } );
};
