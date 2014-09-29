/**
 * Copyright 2014 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
var grunt = require( 'grunt' );
var runTask = require( 'grunt-run-task' );

describe( 'the test_results_merger task', function() {
   'use strict';

   runTask.loadTasks( 'tasks' );

   var dir = {
      fixtures: 'tasks/spec/fixtures',
      expected: 'tasks/spec/expected',
      actual: 'tmp'
   };

   var config = {
      src: [ dir.fixtures + '/widgets/default/*/test/test-results.xml' ],
      dest: dir.actual + '/test-results.xml'
   };
   var task = runTask.task( 'test_results_merger', { default: config } );

   before( task.run( 'default' ) );
   after( task.clean() );

   it( 'creates a `test-results.xml` file containing all the input files\' testsuites', function() {
      expect( grunt.file.exists( dir.actual + '/test-results.xml' ) ).toBeTruthy();
      expect( grunt.file.read( dir.actual + '/test-results.xml' ) )
        .toEqual( grunt.file.read( dir.expected + '/test-results.xml' ) );
   } );

} );
