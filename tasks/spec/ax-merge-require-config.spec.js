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

describe( 'the laxar-merge-require-config task', function() {
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
         result: path.join( dir.expected, project.work, 'my-flow/require_config.js' )
      },
      actual: {
         result: path.join( dir.actual, project.work, 'my-flow/require_config.js' )
      }
   };

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'configured for a given flow', function() {

      var taskConfig;
      var configSpy;

      before( function( done ) {
         // remove result (from previous run or from fixture to another task).
         if( grunt.file.exists( paths.actual.result ) ) {
            grunt.file.delete( paths.actual.result );
         }
         taskConfig = grunt.file.readJSON( paths.fixtures.configuration )[ 'laxar-merge-require-config' ];
         configSpy = spyOn( runTask.grunt.config, 'set' );
         run( 'laxar-merge-require-config:my-flow', taskConfig, dir.actual, done );
      } );

      after( function() {
         configSpy.reset();
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'generates the correctly merged require configuration', function() {
         var actual = grunt.file.read( paths.actual.result );
         var expected = grunt.file.read( paths.expected.result );
         expect( actual ).to.eql( expected );
      } );

   } );

} );
