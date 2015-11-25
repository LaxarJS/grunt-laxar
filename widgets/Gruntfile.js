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

   grunt.registerInitTask( 'prepare', function() {
      var done = this.async();

      var json = grunt.file.readJSON( 'bower.json' );
      var modified = [];

      Object.keys( json.dependencies ).forEach( function( dependency ) {
         var name = dependency.toUpperCase().replace('-', '_') + '_VERSION';
         if( process.env[ name ] ) {
            json.dependencies[ dependency ] = process.env[ name ];
            modified.push( dependency + '#' + process.env[ name ] );
         }
      } );

      if( modified.length ) {
         grunt.log.ok( 'Updating Bower dependency versions for ' + grunt.log.wordlist( modified ) );
         grunt.file.write( 'bower.json', JSON.stringify( json, null, 3 ) );
      }

      grunt.log.ok( 'Installing Bower dependencies……' );

      bower.commands.install( [], {}, { loglevel: 0 } )
         .on( 'error', done )
         .on( 'log', function( message ) {
            var endpoint = message.data && message.data.endpoint || {};
            switch( message.level ) {
               case 'action':
               case 'info':
                  grunt.log.ok( grunt.log.wordlist( [ endpoint.name + '#' + endpoint.target ] ), message.id, message.message );
                  break;
               case 'debug':
                  grunt.log.debug( message.message );
                  break;
               default:
                  grunt.verbose.writeln( JSON.stringify( message, null, 3 ) );
                  break;
            }
         } )
         .on( 'end', function() {
            done();
         } );
   } );

   grunt.registerInitTask( 'init', function() {
      var done = this.async();
      grunt.log.ok( 'Querying Bower dependencies…' );

      bower.commands.list( null, { offline: true } )
         .on( 'error', done )
         .on( 'end', function( list ) {
            var requireConfig = 'require_config.js';
            var name = list.endpoint.name;
            var widget = name.replace( /^widgets\./, '' )
                             .replace( /\./g, '/' );
            var proxies = grunt.config( [ 'karma', 'options', 'proxies' ] );

            proxies[ '/base/widgets/' + widget ] = '/base';

            var template = grunt.file.read( __dirname + '/require_config.js.tmpl' );
            var config = grunt.template.process( template, {
               data: generate( bower.config.directory, list )
            } );
            grunt.file.write( requireConfig, config );

            grunt.log.ok( 'Generated ' + grunt.log.wordlist( [ requireConfig ] ) );

            grunt.config( [ 'karma', 'options', 'proxies' ], proxies );
            grunt.config( [ 'karma', 'options', 'laxar', 'requireConfig' ], requireConfig );

            grunt.log.ok( 'Applied Grunt configuration for ' + grunt.log.wordlist( [ widget ] ) );

            grunt.loadNpmTasks( 'grunt-laxar' );

            done();
         } );
   } );

   grunt.initConfig( {
      karma: {
         options: {
            reporters: [ 'junit', 'coverage', 'progress' ],
            preprocessors: {
               '!(require_config).js': 'coverage',
               '!(bower_components|node_modules|spec)/**/*.js': 'coverage'
            },
            proxies: {},
            files: [
               { pattern: 'bower_components/**', included: false, watched: false },
               { pattern: '!(bower_components|node_modules)/**', included: false, watched: false },
               { pattern: '*.*', included: false, watched: false }
            ]
         },
         default: {
            laxar: {
               specRunner: 'spec/spec_runner.js'
            },
            junitReporter: {
               outputFile: 'test-results.xml'
            },
            coverageReporter: {
               type: 'lcovonly',
               dir: '.',
               file: '../lcov.info'
            }
         }
      },
      jshint: {
         default: {
            src: [ '*.js', '!(bower_components|node_modules)/**/*.js' ]
         }
      }
   } );

   grunt.registerTask( 'test', [ 'karma', 'jshint' ] );
   grunt.registerTask( 'default', [ 'test' ] );
};
