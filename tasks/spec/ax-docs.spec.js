/**
 * Copyright 2014 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */

/* global expect */
require( 'expectations' );

var grunt = require( 'grunt' );
var runTask = require( 'grunt-run-task' );

describe( 'the laxar_dox task', function() {
   'use strict';

   var dir = {
      fixtures: 'tasks/spec/fixtures',
      expected: 'tasks/spec/expected',
      actual: 'tmp'
   };

   describe( 'when called with a single input file', function() {
      var config = {
         src: [
            dir.fixtures + '/libs/test_lib/test.js'
         ],
         dest: dir.actual + '/docs/'
      };
      var task = runTask.task( 'laxar_dox:single', { single: config } );

      before( task.run() );
      after( task.clean() );

      it( 'creates the file in the directory specified as destination', function() {
         expect( grunt.file.exists( config.dest ) ).toBeTruthy();
      } );

      it( 'creates Markdown formatted API documentation', function() {
         var actual = readMarkdownFile( config.dest + '/test.js.md' );
         var expected = readMarkdownFile( dir.expected + '/test.js.md' );

         expect( actual ).toEqual( expected );
      } );
   } );

   describe( 'when called with multiple input files', function() {
      var config = {
         src: [
            dir.fixtures + '/libs/test_lib/test.js',
            dir.fixtures + '/libs/test_lib/test2.js'
         ],
         dest: dir.actual + '/docs/'
      };
      var task = runTask.task( 'laxar_dox:multiple', { multiple: config } );

      before( task.run() );
      after( task.clean() );

      it( 'creates the files in the directory specified as destination', function() {
         expect( grunt.file.exists( config.dest + '/test.js.md' ) ).toBeTruthy();
         expect( grunt.file.exists( config.dest + '/test2.js.md' ) ).toBeTruthy();
      } );

      it( 'creates Markdown formatted API documentation', function() {
         var actual = readMarkdownFile( config.dest + '/test.js.md' );
         var expected = readMarkdownFile( dir.expected + '/test.js.md' );

         expect( actual ).toEqual( expected );

         actual = readMarkdownFile( config.dest + '/test2.js.md' );
         expected = readMarkdownFile( dir.expected + '/test2.js.md' );

         expect(  actual ).toEqual( expected );
      } );
   } );

   function readMarkdownFile( path ) {
      return stripWhitespace( grunt.file.read( path ) );
   }

   function stripWhitespace( str ) {
      return str.replace( /\s/g, '' );
   }

} );
