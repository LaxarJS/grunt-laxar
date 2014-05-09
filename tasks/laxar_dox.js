/**
 * Copyright 2014 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
module.exports = function( grunt ) {
   'use strict';

   var path = require( 'path' );
   var async = require( 'async' );
   var laxarDox = require( 'laxar_dox' );

   grunt.task.registerMultiTask( 'laxar_dox', 'Creates API documentation in Markdown', function() {

      var options = this.options( {
      } );
      var files = this.files;
      var done = this.async();

      async.each( files, function( file, done ) {
         grunt.verbose.writeln( 'Laxar Dox: creating markdown from ' + file.src.length + ' files.' );
         var markdown = file.src.map( grunt.file.read )
            .map( laxarDox.createMarkdown )
            .join( '\n\n----\n\n' );

         grunt.file.write( file.dest, markdown );
         grunt.log.ok( 'Created "' + file.dest + '".' );
         done();
      }, done );
   } );
};
