/**
 * Copyright 2014 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
/*jshint node: true*/
module.exports = function( grunt ) {
   'use strict';

   var mktree = require( './lib/mktree' );
   var path = require( 'path' );
   var fs = require( 'fs' );

   grunt.registerMultiTask( 'directory_tree', 'Generate a JSON mapping of files ' +
      'inside a specific directory tree.', function( n ) {

      var options = this.options( {
         base: '.'
      } );
      var j = 0;
      var files = this.files;
      var done = this.async();
      var one = function() {
         j += 1;
         if( j === files.length ) {
            done();
         }
      };

      files.forEach( function( file ) {
         grunt.verbose.writeln( 'Directory tree: making tree of ' + file.src.length + ' files.' );
         mktree( file.src, path.sep, function( tree ) {
            grunt.file.write( file.dest, JSON.stringify( tree ) );
            grunt.log.ok( 'Created directory tree mapping in "' + file.dest + '".' );
            one();
         } );

      } );
   } );
};
