/**
 * Copyright 2014 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
var grunt = require( 'grunt' );
var helper = require( '../lib/test_helper' );

describe( 'the laxar_dox task', function() {

   'use strict';

   var task = 'laxar_dox';
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
         dest: dir.actual + '/laxar_dox_single.md'
      };

      beforeEach( helper.runMultiTaskWithConfig.bind( null, task, config ) );

      it( 'creates Markdown formatted API documentation', function() {
         var actual = grunt.file.read(dir.actual + '/laxar_dox_single.md');
         var expected = grunt.file.read(dir.expected + '/laxar_dox_single.md');

         expect( actual ).toEqual( expected );
      } );
   } );

   describe( 'when called with multiple input files', function() {
      var config = {
         src: [
            dir.fixtures + '/libs/test_lib/test.js',
            dir.fixtures + '/libs/test_lib/test.js'
         ],
         dest: dir.actual + '/laxar_dox_multiple.md'
      };

      beforeEach( helper.runMultiTaskWithConfig.bind( null, task, config ) );

      it( 'creates Markdown formatted API documentation', function() {
         var actual = grunt.file.read(dir.actual + '/laxar_dox_multiple.md');
         var expected = grunt.file.read(dir.expected + '/laxar_dox_multiple.md');

         expect( actual ).toEqual( expected );
      } );
   } );

} );
