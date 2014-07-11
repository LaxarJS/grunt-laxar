/**
 * Copyright 2014 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
'use strict';

var grunt = require( 'grunt' );
var fs = require( 'fs' );
var mdCodeStream = require( 'md-code-stream' );

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

function runTaskWithConfigFromMarkdown( task, file, section, done ) {
   fs.createReadStream( file )
      .pipe( mdCodeStream() )
      .on( 'entry', function( entry ) {
         if( section === entry.section[entry.section.length-1] ) {
            return;
         }
         evalStream( entry );
      });

   function evalStream( stream ) {
      var data = [];
      stream.on('data', data.push.bind(data));
      stream.on('error', done );
      stream.on('end', function() {
         try {
            // Trust me, JSHint, I know what I'm doing.
            /*jshint -W054*/
            var evaluator = new Function( 'grunt', Buffer.concat(data) );
            evaluator( {
               initConfig: function(config) {
                  setupTaskWithConfig( task, config, done );
                  grunt.task.run( task );
                  grunt.task.start( { asyncDone: true } );
               }
            } );
         }
         catch( err ) {
            done( err );
         }
      } );
   }
}

module.exports = {
   runTaskWithConfig: runTaskWithConfig,
   runMultiTaskWithConfig: runMultiTaskWithConfig,
   runTaskWithConfigFromMarkdown: runTaskWithConfigFromMarkdown
};
