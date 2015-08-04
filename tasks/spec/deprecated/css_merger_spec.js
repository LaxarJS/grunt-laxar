/**
 * Copyright 2014 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */

/* global expect */
require( 'expectations' );

var grunt = require( 'grunt' );
var runTask = require( 'grunt-run-task' );

describe( 'the css_merger task', function() {
   'use strict';

   var dir = {
      fixtures: 'tasks/spec/fixtures',
      expected: 'tasks/spec/expected',
      actual: 'tmp'
   };

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'when using the `base`, `output` and `requireConfig` options', function() {

      var config = {
         options: {
            base: dir.fixtures,
            output: dir.actual,
            requireConfig: dir.fixtures + '/require_config.js'
         },
         src: [
            dir.fixtures + '/application/flow/flow_deprecated.json'
         ]
      };
      var task = runTask.task( 'css_merger:default', { default: config } );

      before( task.run() );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'creates one `.css` file per theme in the output directory', function() {
         expect( grunt.file.exists( dir.actual + '/test.theme.css' ) ).toBeTruthy();
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'creates a `.css` file for the laxar_uikit default.theme', function() {
         expect( grunt.file.exists( dir.actual + '/default.theme.css' ) ).toBeTruthy();
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'writes the default theme stylesheets to the `default.theme.css` file', function() {
         var actual = grunt.file.read( dir.actual + '/default.theme.css' );
         expect( actual.indexOf( '/* MARKER: old-style control: default theme */' ) ).not.toEqual( -1 );
         expect( actual.indexOf( '/* MARKER: new-style control: default theme */' ) ).not.toEqual( -1 );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'writes the test theme stylesheets to the `test.theme.css` file', function() {
         var actual = grunt.file.read( dir.actual + '/test.theme.css' );
         var expected = grunt.file.read( dir.expected + '/test.theme.css' );
         if( actual !== expected ) {
            logErrorMessage( 'Expected and generated output for theme1 differ!' );
            logErrorMessage( 'ACTUAL output: ' + actual );
            logErrorMessage( 'EXPECTED output: ' + expected );
         }
         expect( actual ).toEqual( expected );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'writes the test2 theme stylesheets to the `test2.theme.css` file', function() {
         var actual = grunt.file.read( dir.actual + '/test2.theme.css' );
         var expected = grunt.file.read( dir.expected + '/test2.theme.css' );
         if( actual !== expected ) {
            logErrorMessage( 'Expected and generated output for theme2 differ!' );
            logErrorMessage( 'ACTUAL output: ' + actual );
            logErrorMessage( 'EXPECTED output: ' + expected );
         }
         expect( actual ).toEqual( expected );
      } );

   } );

   function logErrorMessage( message ) {
      // because grunt.log modifies its input for "pretty-printing", we log directly to stderr
      process.stderr.write( message );
      process.stderr.write( '\n' );
   }

} );
