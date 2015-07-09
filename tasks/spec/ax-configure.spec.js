/**
 * Copyright 2015 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
var path = require( 'path' );
var grunt = require( 'grunt' );
var runTask = require( 'grunt-run-task' );
var expect = require( 'expect.js' );

var run = require( './lib/run-elsewhere' );
var spyOn = require( './lib/spy-on' );

describe( 'the laxar-configure task', function() {
   'use strict';

   var dir = {
      fixtures: 'tasks/spec/fixtures',
      expected: 'tasks/spec/expected',
      actual: 'tmp'
   };

   var project = {
      flow: 'application/flow/flow.json',
      work: 'var/flows'
   };

   var paths = {
      fixtures: {
         flow: path.join( dir.fixtures, project.flow )
      },
      expected: {
         result: path.join( dir.expected, project.work, 'my-flow/work/task-configuration.json' )
      },
      actual: {
         flow: path.join( dir.actual, project.flow ),
         result: path.join( dir.actual, project.work, 'my-flow/work/task-configuration.json' )
      }
   };

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'configured for a single flow', function() {

      var taskConfig = {
         options: {
            base: dir.actual,
            workDirectory: project.work,
            flows: [
               { target: 'my-flow', src: project.flow }
            ]
         }
      };

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      var configSpy;

      before( function( done ) {
         // remove result (from previous run or from fixture to another task).
         if( grunt.file.exists( paths.actual.result ) ) {
            grunt.file.delete( paths.actual.result );
         }
         configSpy = spyOn( runTask.grunt.config, 'set' );
         run( 'laxar-configure', taskConfig, dir.actual, done );
      } );

      after( function() {
         configSpy.reset();
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'writes task configuration for grunt-laxar building blocks to a file', function() {
         expect( grunt.file.exists( paths.actual.result ) ).to.be( true );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      [
         'laxar-build-flow',
         'laxar-artifacts',
         'laxar-dependencies',
         'laxar-configure-watch',
         'laxar-resources',
         'laxar-dist-flow',
         'laxar-dist-css',
         'laxar-dist-js'
      ].forEach( function( taskName ) {
         it( 'configures the building block ' + taskName + ' at runtime', function() {
            expect( configSpy.calls.filter( configures( taskName + '.my-flow' ) ) ).not.to.be.empty();
         } );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      [
         'connect.laxar-develop.options.port',
         'connect.laxar-test.options.port',
         'connect.options.livereload',
         'watch.options.livereload',
         'karma.options.proxies./base'
      ].forEach( function( key ) {
         it( 'configures the ' + key + ' at runtime', function() {
            expect( configSpy.calls.filter( configures( key ) ) ).not.to.be.empty();
         } );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'generates the correct task configuration', function() {
         var actual = grunt.file.readJSON( paths.actual.result );
         var expected = grunt.file.readJSON( paths.expected.result );
         expect( actual ).to.eql( expected );
      } );

   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function configures( task ) {
      return function ( callargs ) {
         return callargs[ 0 ] === task;
      };
   }

} );
