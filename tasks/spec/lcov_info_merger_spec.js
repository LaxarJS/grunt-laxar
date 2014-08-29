/**
 * Copyright 2014 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
var grunt = require( 'grunt' );
var helper = require( '../lib/test_helper' );

describe( 'the lcov_info_merger task', function() {

   'use strict';

   var task = 'lcov_info_merger';
   var dir = {
      fixtures: 'tasks/spec/fixtures',
      expected: 'tasks/spec/expected',
      actual: 'tmp'
   };

   var config = {
      src: [ dir.fixtures + '/widgets/default/*/test/*/lcov.info' ],
      dest: dir.actual + '/lcov.info'
   };

   beforeEach( helper.runMultiTaskWithConfig.bind( null, task, config ) );

   it( 'creates an `lcov.info` file containing all the input files\' coverage data', function() {
      expect( grunt.file.exists( dir.actual + '/lcov.info' ) ).toBeTruthy();
      expect( grunt.file.read( dir.actual + '/lcov.info' ) )
        .toEqual( grunt.file.read( dir.expected + '/lcov.info' ) );
   } );

} );
