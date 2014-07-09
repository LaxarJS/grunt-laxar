/**
 * Copyright 2014 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
/*jshint node: true*/
module.exports = function (grunt) {
   'use strict';

   var bower = require( 'bower' );
   var generate = require( './generate_require' );

   grunt.registerInitTask( 'autoinit', function() {
      var done = this.async();

      bower.commands.list()
         .on( 'end', function( list ) {
            var name = list.endpoint.name;
            var widget = name.replace( /^widgets\./, '' )
                             .replace( /\./g, '/' );
            var port = Math.floor( Math.random() * 10000 ) + 10000;
            var proxies = {};


            proxies[ '/base/widgets/' + widget ] = proxies[ '/base' ] = 'http://localhost:' + port;

            var template = grunt.file.read( __dirname + '/require_config.js.tmpl' );
            var config = grunt.template.process( template, {
               data: generate( bower.config.directory, list )
            } );
            grunt.file.write( 'require_config.js', config );

            grunt.log.ok( 'Generated ' + grunt.log.wordlist( [ 'require_config.js' ] ) );

            grunt.initConfig( {
               connect: {
                  options: {
                     hostname: '*',
                     port: port
                  },
                  default: {}
               },
               karma: {
                  options: {
                     reporters: [ 'junit', 'progress' ],
                     proxies: proxies
                  },
                  default: {
                     laxar: {
                        specRunner: 'spec/spec_runner.js',
                        requireConfig: 'require_config.js'
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
               }
            } );

            grunt.log.ok( 'Applied Grunt configuration for ' + grunt.log.wordlist( [ widget ] ) );

            grunt.loadNpmTasks( 'grunt-laxar' );

            done();
         } )
         .on( 'error', function( err ) {
            done( err );
         } );
   } );

   grunt.task.run( 'autoinit' );

   grunt.registerTask( 'test', [ 'connect', 'karma', 'jshint' ] );
   grunt.registerTask( 'default', [ 'test' ] );
};
