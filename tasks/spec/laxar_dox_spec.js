/**
 * Copyright 2014 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
var grunt = require( 'grunt' );
var runTask = require( 'grunt-run-task' );

describe( 'the laxar_dox task', function() {
   'use strict';

   runTask.loadTasks( 'tasks' );

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
      var task = runTask.task( 'laxar_dox', { single: config } );

      before( task.run( 'single' ) );
      after( task.clean() );

      it( 'creates the file specified as destination', function() {
         expect( grunt.file.exists( config.dest ) ).toBeTruthy();
      } );

      it( 'creates Markdown formatted API documentation', function() {
         var actual = grunt.file.read( config.dest );
         var expected = grunt.file.read( dir.expected + '/laxar_dox_single.md' );

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
      var task = runTask.task( 'laxar_dox', { multiple: config } );

      before( task.run( 'multiple' ) );
      after( task.clean() );

      it( 'creates the file specified as destination', function() {
         expect( grunt.file.exists( config.dest ) ).toBeTruthy();
      } );

      it( 'creates Markdown formatted API documentation', function() {
         var actual = grunt.file.read( config.dest );
         var expected = grunt.file.read( dir.expected + '/laxar_dox_multiple.md' );

         expect( actual ).toEqual( expected );
      } );
   } );

} );
