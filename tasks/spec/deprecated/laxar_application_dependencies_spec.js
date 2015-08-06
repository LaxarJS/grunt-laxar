/**
 * Copyright 2014 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */

/* global expect */
require( 'expectations' );

var grunt = require( 'grunt' );
var runTask = require( 'grunt-run-task' );

describe( 'the laxar_application_dependencies task', function() {
   'use strict';

   var dir = {
      fixtures: 'tasks/spec/fixtures',
      expected: 'tasks/spec/expected',
      actual: 'tmp'
   };

   describe( 'when using the default configuration', function() {
      var config = {
         options: {
            controls: dir.fixtures + '/controls',
            base: dir.fixtures,
            requireConfig: dir.fixtures + '/require_config.js'
         },
         src: [
            dir.fixtures + '/application/flow/flow_deprecated.json'
         ],
         dest: dir.actual + '/laxar_application_dependencies.js'
      };
      var task = runTask.task( 'laxar_application_dependencies:default', { default: config } );

      before( task.run() );
      after( task.clean() );

      it( 'creates the file specified as destination', function() {
         expect( grunt.file.exists( config.dest ) ).toBeTruthy();
      } );

      it( 'writes the expected RequireJS module to the destination file', function() {
         var actual = grunt.file.read( dir.actual + '/laxar_application_dependencies.js' );
         var expected = grunt.file.read( dir.expected + '/laxar_application_dependencies.js' );

         expect( actual ).toEqual( expected );
      } );

   } );


} );
