/**
 * Copyright 2014 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
var grunt = require( 'grunt' );
var helper = require( '../lib/test_helper' );

describe( 'the portal_angular_dependencies task', function() {

   'use strict';

   var task = 'portal_angular_dependencies';
   var dir = {
      fixtures: 'tasks/spec/fixtures',
      expected: 'tasks/spec/expected',
      actual: 'tmp'
   };

   describe( 'when using the default configuration', function() {
      var config = {
         options: {
            base: dir.fixtures,
            requireConfig: dir.fixtures + '/require_config.js'
         },
         src: [
            dir.fixtures + '/application/flow/flow.json'
         ],
         dest: dir.actual + '/portal_angular_dependencies.js'
      };

      beforeEach( helper.runMultiTaskWithConfig.bind( null, task, config ) );

      it( 'creates the file specified as destination', function() {
         expect( grunt.file.exists( config.dest ) ).toBeTruthy();
      } );

      it( 'writes the expected RequireJS module to the destination file', function() {
         var actual = grunt.file.read( dir.actual + '/portal_angular_dependencies.js' );
         var expected = grunt.file.read( config.dest );

         expect( actual ).toEqual( expected );
      } );

   } );


} );
