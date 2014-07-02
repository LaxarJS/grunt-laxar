/**
 * Copyright 2014 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
var mktree = require( '../mktree' );
var path = require( 'path' );

describe( 'mktree( base, filelist, embedContents, callback )', function() {
   'use strict';

   var TYPE_DIRECTORY = 0;
   var TYPE_FILE = 1;

   it( 'calls the callback when finished', function( done ) {
      mktree( '.', [], [], done );
   } );

   it( 'returns a promise that is resolved when finished', function( done ) {
      mktree( '.', [], [], function() {} ).then( done.bind( null, null ) );
   } );

   describe( 'when called with a list of files and a callback', function() {

      var tree;
      var thisFile = path.basename( __filename );
      var files = [
         'tasks',
         'lib/spec/data/require_config_a.js',
         'lib/spec/data/require_config_b.js'
      ];

      beforeEach( function( done ) {
         mktree( '.', files, [], function( err, result ) {
            tree = result;
            done( err );
         } );
      } );

      it( 'builds a tree-like structure from the given paths', function() {
         expect( tree.lib.spec ).toBeDefined();
      } );

      it( 'records the file type (directory or file) for each given file', function() {
         expect( tree ).toEqual( {
            'tasks': TYPE_DIRECTORY,
            'lib': {
               'spec': {
                  'data': {
                     'require_config_a.js': TYPE_FILE,
                     'require_config_b.js': TYPE_FILE
                  }
               }
            }
         } );
      } );

   } );

   describe( 'when called with a file that does not exist', function() {

      it( 'calls the callback with an error as the first parameter', function( done ) {
         mktree( ',', [ 'no-such-file' ], [], function( err, tree ) {
            expect( err instanceof Error ).toEqual( true );
            done();
         } );
      } );

   } );

   describe( 'when called with a different base directory', function() {

      it( 'looks for files in the given directory', function( done ) {
         mktree( 'lib/spec/data', [
            'require_config_a.js',
            'require_config_b.js'
         ], [], function( err, tree ) {
            expect( tree ).toEqual( {
               'require_config_a.js': TYPE_FILE,
               'require_config_b.js': TYPE_FILE
            } );
            done( err );
         } );
      } );

   } );

   describe( 'when asked to embed contents', function() {

      it( 'embeds the requested contents', function( done ) {
         mktree( 'lib/spec/data', [
            'require_config_a.js',
            'test.json',
            'test.html'
         ], [ 'test.json', 'test.html' ], function( err, tree ) {
            expect( tree ).toEqual( {
               'require_config_a.js': TYPE_FILE,
               'test.json': '{"some":"file"}',
               'test.html': '<p> Test! </p>'
            } );
            done( err );
         } );
      } );

      it( 'does not embed excluded contents', function( done ) {
         mktree( 'lib/spec/data', [
            'require_config_a.js',
            'test.json',
            'test.html'
         ], [ '**/*.json', '**/*.html', '!test.json' ], function( err, tree ) {
            expect( tree ).toEqual( {
               'require_config_a.js': TYPE_FILE,
               'test.json': TYPE_FILE,
               'test.html': '<p> Test! </p>'
            } );
            done( err );
         } );
      } );

   } );

} );
