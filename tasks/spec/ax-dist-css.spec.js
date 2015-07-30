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

describe( 'the laxar-dist-css task', function() {
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
         defaultTheme: path.join( dir.expected, project.work, 'my-flow/dist/default.theme.css' ),
         defaultThemeSourceMap: path.join( dir.expected, project.work, 'my-flow/dist/default.theme.css.map' ),
         testTheme: path.join( dir.expected, project.work, 'my-flow/dist/test.theme.css' ),
         testThemeSourceMap: path.join( dir.expected, project.work, 'my-flow/dist/test.theme.css.map' ),
         test2Theme: path.join( dir.expected, project.work, 'my-flow/dist/test2.theme.css' ),
         test2ThemeSourceMap: path.join( dir.expected, project.work, 'my-flow/dist/test2.theme.css.map' )
      },
      actual: {
         defaultTheme: path.join( dir.actual, project.work, 'my-flow/dist/default.theme.css' ),
         defaultThemeSourceMap: path.join( dir.actual, project.work, 'my-flow/dist/default.theme.css.map' ),
         testTheme: path.join( dir.actual, project.work, 'my-flow/dist/test.theme.css' ),
         testThemeSourceMap: path.join( dir.actual, project.work, 'my-flow/dist/test.theme.css.map' ),
         test2Theme: path.join( dir.actual, project.work, 'my-flow/dist/test2.theme.css' ),
         test2ThemeSourceMap: path.join( dir.actual, project.work, 'my-flow/dist/test2.theme.css.map' )
      }
   };

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'configured for a given flow', function() {

      var taskConfig;

      before( function( done ) {
         taskConfig = grunt.file.readJSON( paths.fixtures.configuration )[ 'laxar-dist-css' ];
         run( 'laxar-dist-css:my-flow', taskConfig, dir.actual, done );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'generates the correct default.theme stylesheet', function() {
         var actual = grunt.file.read( paths.actual.defaultTheme );
         var expected = grunt.file.read( paths.expected.defaultTheme );
         expect( actual ).to.eql( expected );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'generates the correct default.theme source-map', function() {
         var actual = grunt.file.read( paths.actual.defaultThemeSourceMap );
         var expected = grunt.file.read( paths.expected.defaultThemeSourceMap );
         expect( actual ).to.eql( expected );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'generates the correct test.theme stylesheet', function() {
         var actual = grunt.file.read( paths.actual.testTheme );
         var expected = grunt.file.read( paths.expected.testTheme );
         expect( actual ).to.eql( expected );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'generates the correct test.theme source-map', function() {
         var actual = grunt.file.read( paths.actual.testThemeSourceMap );
         var expected = grunt.file.read( paths.expected.testThemeSourceMap );
         expect( actual ).to.eql( expected );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'generates the correct test2.theme stylesheet', function() {
         var actual = grunt.file.read( paths.actual.test2Theme );
         var expected = grunt.file.read( paths.expected.test2Theme );
         expect( actual ).to.eql( expected );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'generates the correct test2.theme source-map', function() {
         var actual = grunt.file.read( paths.actual.test2ThemeSourceMap );
         var expected = grunt.file.read( paths.expected.test2ThemeSourceMap );
         expect( actual ).to.eql( expected );
      } );

   } );

} );
