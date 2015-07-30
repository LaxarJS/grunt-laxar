/**
 * Copyright 2015 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
var path = require( 'path' );
var grunt = require( 'grunt' );
var runTask = require( 'grunt-run-task' );
var expect = require( 'expect.js' );

var spyOn = require( './lib/spy-on' );
var run = require( './lib/run-elsewhere' );

describe( 'the laxar-dist-js task', function() {
   'use strict';

   var dir = {
      fixtures: 'tasks/spec/fixtures',
      expected: 'tasks/spec/expected',
      actual: 'tmp'
   };

   var project = {
      work: 'var/flows'
   };

   var paths = {
      fixtures: {
         configuration: path.join( dir.fixtures, project.work, 'my-flow/work/task-configuration.json' )
      },
      expected: {
         bundle: path.join( dir.expected, project.work, 'my-flow/dist/bundle.js' ),
         sourceMap: path.join( dir.expected, project.work, 'my-flow/dist/bundle.js.map' )
      },
      actual: {
         bundle: path.join( dir.actual, project.work, 'my-flow/dist/bundle.js' ),
         sourceMap: path.join( dir.actual, project.work, 'my-flow/dist/bundle.js.map' )
      }
   };

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'configured for a given flow', function() {

      var taskConfig;

      before( function( done ) {
         taskConfig = grunt.file.readJSON( paths.fixtures.configuration )[ 'laxar-dist-js' ];
         taskConfig.base = 'tmp';
         run( 'laxar-dist-js:my-flow', taskConfig, dir.actual, done );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'generates the correct javascript bundle', function() {
         var actual = grunt.file.read( paths.actual.bundle );
         var expected = grunt.file.read( paths.expected.bundle );
         expect( actual ).to.eql( expected );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'generates the correct source map', function() {
         var actual = grunt.file.read( paths.actual.sourceMap );
         var expected = grunt.file.read( paths.expected.sourceMap );
         expect( actual ).to.eql( expected );
      } );

   } );

} );
