/**
 * Copyright 2014 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
module.exports = function( grunt ) {
   'use strict';

   var fs = require( 'fs' );
   var path = require( 'path' );
   var async = require( 'async' );
   var mktree = require( './lib/mktree' );

   grunt.registerMultiTask( 'directory_tree', 'Generate a JSON mapping of files ' +
      'inside a specific directory tree.', function( n ) {

      var options = this.options( {
         base: '.'
      } );
      var files = this.files;
      var done = this.async();

      async.each( files, function( file, done ) {
         grunt.verbose.writeln( 'Directory tree: making tree of ' + file.src.length + ' files.' );
         mktree( file.src, path.sep, function( tree ) {
            grunt.file.write( file.dest, JSON.stringify( tree ) );
            grunt.log.ok( 'Created directory tree mapping in "' + file.dest + '".' );
            done();
         } );
      }, done );
   } );
};
