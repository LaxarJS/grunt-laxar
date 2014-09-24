/**
 * Copyright 2014 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
var grunt = require( 'grunt' );
var runTask = require( 'grunt-run-task' );

describe( 'the directory_tree task', function() {

   'use strict';

   var dir = {
      fixtures: 'tasks/spec/fixtures',
      expected: 'tasks/spec/expected',
      actual: 'tmp'
   };

   describe( 'when using the default configuration', function() {
      var config = {
         src: [
            dir.fixtures + '/libs/**/*.js'
         ],
         dest: dir.actual + '/directory_tree_default.json'
      };
      var task = runTask.task( 'directory_tree', { default: config } );

      before( task.run( 'default' ) );
      after( task.clean() );

      it( 'creates the file specified as destination', function() {
         expect( grunt.file.exists( config.dest ) ).toBeTruthy();
      } );

      it( 'creates a json file containing the requested mapping', function() {
         var actual = grunt.file.readJSON( config.dest );
         var expected = grunt.file.readJSON( dir.expected + '/directory_tree_default.json' );

         expect( actual ).toEqual( expected );
      } );

   } );

   describe( 'when using the `base` option', function() {
      var config = {
         options: {
            base: dir.fixtures
         },
         src: [
            dir.fixtures + '/libs/**/*.js'
         ],
         dest: dir.actual + '/directory_tree_basedir.json'
      };
      var task = runTask.task( 'directory_tree', { basedir: config } );

      before( task.run( 'basedir' ) );
      after( task.clean() );

      it( 'creates the file specified as destination', function() {
         expect( grunt.file.exists( config.dest ) ).toBeTruthy();
      } );

      it( 'creates a json file containing the requested mapping', function() {
         var actual = grunt.file.readJSON( dir.actual + '/directory_tree_basedir.json' );
         var expected = grunt.file.readJSON( dir.expected + '/directory_tree_basedir.json' );

         expect( actual ).toEqual( expected );
      } );

   } );

} );
