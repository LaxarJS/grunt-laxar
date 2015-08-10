/**
 * Copyright 2014 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */

/* global expect */
require( 'expectations' );

var path = require( '../../../lib/path-platform/path' ).posix;
var grunt = require( 'grunt' );
var run = require( '../lib/run-elsewhere' );


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
            controls: './controls',
            base: '.',
            requireConfig: './require_config.js'
         },
         src: [
            'application/flow/flow_deprecated.json'
         ],
         dest: './laxar_application_dependencies.js'
      };

      before( function( done ) {
         run( 'laxar_application_dependencies:default', { default: config }, dir.actual, done );
      } );

      it( 'creates the file specified as destination', function() {
         expect( grunt.file.exists( path.join( dir.actual, config.dest ) ) ).toBeTruthy();
      } );

      it( 'writes the expected RequireJS module to the destination file', function() {
         var actual = grunt.file.read( dir.actual + '/laxar_application_dependencies.js' );
         var expected = grunt.file.read( dir.expected + '/laxar_application_dependencies.js' );

         expect( actual ).toEqual( expected );
      } );

   } );


} );
