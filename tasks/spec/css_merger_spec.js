/**
 * Copyright 2014 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
var grunt = require( 'grunt' );
var helper = require( '../lib/test_helper' );

describe( 'the css_merger task', function() {

   'use strict';

   var task = 'css_merger';
   var dir = {
      fixtures: 'tasks/spec/fixtures',
      expected: 'tasks/spec/expected',
      actual: 'tmp'
   };

   describe( 'when using the `base`, `output` and `requireConfig` options', function() {
      var config = {
         options: {
            base: dir.fixtures,
            output: dir.actual,
            requireConfig: dir.fixtures + '/require_config.js'
         },
         src: [
            dir.fixtures + '/application/flow/flow.json'
         ]
      };

      beforeEach( helper.runMultiTaskWithConfig.bind( null, task, config ) );

      it( 'creates one `.css` file per theme in the output directory', function() {
         expect( grunt.file.exists( dir.actual + '/test.theme.css' ) ).toBeTruthy();
      } );

      it( 'creates a `.css` file for the laxar_uikit default.theme', function() {
         expect( grunt.file.exists( dir.actual + '/default.theme.css' ) ).toBeTruthy();
      } );

      it( 'writes the expected stylesheets to the `default.theme.css` file', function() {
         var actual = grunt.file.read( dir.actual + '/test.theme.css' );
         var expected = grunt.file.read( dir.expected + '/test.theme.css' );

         expect( actual ).toEqual( expected );
      } );

   } );

} );
