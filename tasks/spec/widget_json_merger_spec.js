/**
 * Copyright 2014 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
var grunt = require( 'grunt' );
var helper = require( '../lib/test_helper' );

describe( 'the widget_json_merger task', function() {

   'use strict';

   var task = 'widget_json_merger';
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
         }
      };

      beforeEach( helper.runMultiTaskWithConfig.bind( null, task, config ) );

      it( 'creates a `widgets.js` file in the output directory', function() {
         expect( grunt.file.exists( dir.actual + '/widgets.js' ) ).toBeTruthy();
      } );

      it( 'writes the expected RequireJS modules to the `widgets.js` file', function() {
         var actual = grunt.file.read( dir.actual + '/widgets.js' );
         var expected = grunt.file.read( dir.expected + '/widgets.js' );

         expect( actual ).toEqual( expected );
      } );

   } );

} );
