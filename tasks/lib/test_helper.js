/**
 * Copyright 2014 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
'use strict';

var grunt = require( 'grunt' );

function noop() {}

var logger = {
   header: noop,
   debug: noop,
   wordlist: noop,
   ok: noop
};

function setupTaskWithConfig( task, config, done ) {
   grunt.log = logger;
   grunt.loadTasks( 'tasks' );
   grunt.task.options( {
      error: function( err ) {
         done( err );
      },
      done: done
   } );
   grunt.initConfig( {} );
   grunt.config( task, config );
}

function runTaskWithConfig( task, config, done ) {
   setupTaskWithConfig( task, config, done );
   grunt.task.run( task );
   grunt.task.start( { asyncDone: true } );
}

function runMultiTaskWithConfig( task, config, done ) {
   setupTaskWithConfig( task, {
      default: config
   }, done );
   grunt.task.run( task + ':default' );
   grunt.task.start( { asyncDone: true } );
}

module.exports = {
   runTaskWithConfig: runTaskWithConfig,
   runMultiTaskWithConfig: runMultiTaskWithConfig
};
