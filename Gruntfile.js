/**
 * Copyright 2014 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
/*jshint node: true*/
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
      'npm-publish': {
         options: {
            requires: [ 'test' ]
         }
      },
      'npm-contributors': {
         options: {
            commitMessage: 'update contributors'
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

   grunt.loadNpmTasks( 'grunt-contrib-jshint' );
   grunt.loadNpmTasks( 'grunt-bump' );
   grunt.loadNpmTasks( 'grunt-npm' );
   grunt.loadNpmTasks( 'grunt-auto-release' );

   grunt.registerTask( 'test', ['jshint'] );
   grunt.registerTask( 'default', ['test'] );

   grunt.registerTask( 'release', 'Test, bump and publish to NPM.', function( type ) {
      grunt.task.run( [
         'test',
         'npm-contributors',
         'bump:#{type || \'patch\'}'
      // 'npm-publish'
      ] );
   } );
};
