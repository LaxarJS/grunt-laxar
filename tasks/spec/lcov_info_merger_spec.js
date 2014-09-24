/**
 * Copyright 2014 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
var grunt = require( 'grunt' );
var runTask = require( 'grunt-run-task' );

describe( 'the lcov_info_merger task', function() {
   'use strict';

   runTask.loadTasks( 'tasks' );

   var dir = {
      fixtures: 'tasks/spec/fixtures',
      expected: 'tasks/spec/expected',
      actual: 'tmp'
   };

   var config = {
      src: [ dir.fixtures + '/widgets/default/*/test/*/lcov.info' ],
      dest: dir.actual + '/lcov.info'
   };
   var task = runTask.task( 'lcov_info_merger', { default: config } );

   before( task.run( 'default' ) );
   after( task.clean() );

   it( 'creates an `lcov.info` file containing all the input files\' coverage data', function() {
      expect( grunt.file.exists( dir.actual + '/lcov.info' ) ).toBeTruthy();
      expect( grunt.file.read( dir.actual + '/lcov.info' ) )
        .toEqual( grunt.file.read( dir.expected + '/lcov.info' ) );
   } );

} );
