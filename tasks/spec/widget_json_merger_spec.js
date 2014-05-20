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

   describe( 'when using the default configuration', function() {
      var config = {
         options: {
            base: dir.fixtures,
            output: dir.actual,
            requireConfig: dir.fixtures + '/require_config.js'
         },
         src: [
            dir.fixtures + '/**/*.js'
         ],
         dest: dir.actual + '/directory_tree_default.json'
      };

      beforeEach( helper.runMultiTaskWithConfig.bind( null, task, config ) );

      it( 'creates a widgets.js file in the output directory', function() {
         var actual = grunt.file.read(dir.actual + '/widgets.js');
         var expected = grunt.file.read(dir.expected + '/widgets.js');

         expect( actual ).toEqual( expected );
      } );

   } );

} );
