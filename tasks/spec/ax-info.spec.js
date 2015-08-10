/**
 * Copyright 2015 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
var grunt = require( 'grunt' );
var runTask = require( 'grunt-run-task' );
var expect = require( 'expect.js' );

var run = require( './lib/run-elsewhere' );
var spyOn = require( './lib/spy-on' );

describe( 'the laxar-info task', function() {
   'use strict';

   var dir = {
      fixtures: 'tasks/spec/fixtures',
      actual: 'tmp'
   };

   var project = {
      flow: 'application/flow/flow.json',
      work: 'var/flows'
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

      var task;
      before( function( done ) {
         task = run( 'laxar-info', taskConfig, dir.actual, done );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'runs without failing', function() {
         // we should add better tests once we have access to the grunt-run-task output stream
      } );

   } );

} );
