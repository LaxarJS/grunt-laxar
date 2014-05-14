/**
 * Copyright 2014 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
var mktree = require( '../mktree' );
var path = require( 'path' );

describe( 'mktree( filelist, callback )', function() {
   'use strict';

   it( 'calls the callback when finished', function( done ) {
      mktree( [], done );
   } );

   it( 'returns a promise that is resolved when finished', function( done ) {
      mktree( [], function() {} ).then( done.bind( null, null ) );
   } );

   describe( 'when called with a list of files and a callback', function() {

      var tree;
      var thisFile = path.basename( __filename );
      var files = [
         'tasks',
         'Gruntfile.js',
         'lib/spec'
      ];

      beforeEach( function( done ) {
         mktree( files, function( err, result ) {
            tree = result;
            done( err );
         } );
      } );

      it( 'builds a tree-like structure from the given paths', function() {
         expect( tree.lib.spec ).toBeDefined();
      } );

      it( 'records the file type (directory or file) for each given file', function() {
         expect( tree ).toEqual( {
            'tasks': 'directory',
            'Gruntfile.js': 'file',
            'lib': {
               'spec': 'directory'
            }
         } );
      } );

   } );

   describe( 'when called with a file that does not exist', function() {

      it( 'calls the callback with an error as the first parameter', function( done ) {
         mktree( [
            'no-such-file'
         ], function( err, tree ) {
            expect( err instanceof Error ).toEqual( true );
            done();
         } );
      } );

   } );

} );
