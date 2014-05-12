/**
 * Copyright 2014 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
module.exports = function( grunt ) {
   'use strict';

   var pkg = grunt.file.readJSON( 'package.json' );

   grunt.initConfig({
      jshint: {
         options: {
            jshintrc: '.jshintrc'
         },
         gruntfile: {
            src: 'Gruntfile.js'
         },
         lib: {
            src: 'lib/**/*.js'
         },
         tasks: {
            src: 'tasks/**/*.js'
         }
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

   grunt.registerTask( 'test', [ 'mochacli', 'jshint' ] );
   grunt.registerTask( 'default', ['test'] );

   grunt.registerTask( 'release', 'Test, bump and publish to NPM.', function( type ) {
      grunt.task.run( [
         'test',
         'bump:#{type || \'patch\'}'
      // 'npm-publish'
      ] );
   } );
};
