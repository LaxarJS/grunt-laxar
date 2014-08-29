/**
 * Copyright 2014 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
module.exports = function( grunt ) {
   'use strict';

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

   grunt.registerMultiTask( 'test_results_merger', function() {
      this.files.forEach( function( file ) {
         grunt.log.ok( 'Creating merged ' + grunt.log.wordlist( [ file.dest ] ) );
         grunt.file.write( file.dest, mergeTags( 'testsuites', file.src.map( grunt.file.read ) ) );
      } );
   } );

   grunt.registerMultiTask( 'lcov_info_merger', function() {
      this.files.forEach( function( file ) {
         grunt.log.ok( 'Creating merged ' + grunt.log.wordlist( [ file.dest ] ) );
         grunt.file.write( file.dest, file.src.map( grunt.file.read ).join( '\n' ) );
      } );
   } );

};
