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
   var mktree = require( '../lib/mktree' );

   grunt.registerMultiTask( 'directory_tree', 'Generate a JSON mapping of files ' +
      'inside a specific directory tree.', function( n ) {

      var options = this.options( {
         base: '.'
      } );
      var files = this.files;
      var base = options.base;
      var done = this.async();

      async.each( files, function( file, done ) {
         var srcs = file.src.map( function( file ) {
            return path.relative( base, file );
         } );
         var dest = file.dest;

         grunt.verbose.writeln( 'Directory tree: making tree of ' + srcs.length + ' files.' );

         mktree( base, srcs, options.embedContents, function( err, tree ) {
            if( !err ) {
               grunt.file.write( dest, JSON.stringify( tree ) );
               grunt.log.ok( 'Created directory tree mapping in "' + dest + '".' );
            }
            done( err );
         } );
      }, done );
   } );
};
