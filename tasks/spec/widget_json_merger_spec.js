/**
 * Copyright 2014 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
var grunt = require( 'grunt' );
var runTask = require( 'grunt-run-task' );

describe( 'the widget_json_merger task', function() {
   'use strict';

   runTask.loadTasks( 'tasks' );

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
      var task = runTask.task( 'widget_json_merger', { default: config } );

      before( task.run( 'default' ) );
      after( task.clean() );

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
