/**
 * Copyright 2014 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
/*jshint node: true*/
module.exports = function (grunt) {
   'use strict';

   var bower = grunt.file.readJSON( 'bower.json' );
   var widget = bower.name.replace( /^widgets\./, '' ).replace( /\./g, '/' );

   var port = Math.floor( Math.random() * 10000 ) + 10000;
   var proxies = {};

   proxies[ '/base/widgets/' + widget ] = proxies[ '/base' ] = 'http://localhost:' + port;

   grunt.initConfig( {
      connect: {
         options: {
            port: port
         },
         default: {}
      },
      karma: {
         options: {
            reporters: ['junit', 'progress'],
            proxies: proxies
         },
         default: {
            laxar: {
               specRunner: 'spec/spec_runner.js',
               requireConfig: __dirname + '/require_config.js'
            },
            junitReporter: {
               outputFile: 'junit.xml'
            }
         }
      },
      jshint: {
         default: {
            src: [ '*.js', '!(bower_components|node_modules)/**/*.js' ]
         }
      },
      watch: {
         default: {
            files: [ '*', '!(bower_components|node_modules)/**' ],
            tasks: [ 'karma', 'jshint' ]
         }
      }
   } );

   grunt.loadNpmTasks( 'grunt-laxar' );

   grunt.registerTask( 'test', [ 'connect', 'karma', 'jshint' ] );
   grunt.registerTask( 'default', [ 'test' ] );
};
