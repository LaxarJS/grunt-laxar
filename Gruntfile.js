/**
 * Copyright 2014 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
module.exports = function( grunt ) {
   'use strict';

   var pkg = grunt.file.readJSON( 'package.json' );

   grunt.initConfig({
      clean: {
         test: [ 'tmp' ],
         fixtures: [ 'tasks/spec/fixtures/bower_components' ]
      },
      jshint: {
         options: {
            jshintrc: '.jshintrc'
         },
         gruntfile: [
            __filename
         ],
         lib: [
            'lib/*.js'
         ],
         tasks: [
            'tasks/*.js',
            'tasks/lib/*.js'
         ],
         spec: [
            'lib/spec/*.js',
            'tasks/spec/*.js'
         ]
      },
      mochacli: {
         options: {
            ui: 'bdd',
            reporter: 'spec',
            require: ['expectations']
         },
         lib: [
            'lib/spec/*_spec.js'
         ],
         tasks: [
            'tasks/spec/*_spec.js'
         ]
      },
      'npm-publish': {
         options: {
            requires: [ 'test' ]
         }
      },
      bump: {
         options: {
            commitMessage: 'release v%VERSION%',
            tagName: 'v%VERSION%',
            tagMessage: 'version %VERSION%',
            pushTo: 'origin'
         }
      }
   });

   grunt.loadNpmTasks( 'grunt-contrib-clean' );
   grunt.loadNpmTasks( 'grunt-contrib-jshint' );
   grunt.loadNpmTasks( 'grunt-mocha-cli' );
   grunt.loadNpmTasks( 'grunt-bump' );

   grunt.registerTask( 'test', [ 'clean', 'fixtures', 'mochacli', 'jshint' ] );
   grunt.registerTask( 'default', ['test'] );

   grunt.registerTask( 'release', 'Test, bump and publish to NPM.', function( type ) {
      grunt.task.run( [
         'test',
         'bump:#{type || \'patch\'}'
      // 'npm-publish'
      ] );
   } );

   grunt.registerTask( 'fixtures', 'Setup the test fixtures', function() {
      var bower = require.resolve( 'bower/bin/bower' );
      var done = this.async();
      var dir = 'tasks/spec/fixtures';

      grunt.log.ok( 'Installing bower packages in ' + dir );
      grunt.util.spawn( {
         cmd: bower,
         args: [ 'install' ],
         opts: {
            cwd: dir
         }
      }, done );
   } );
};
