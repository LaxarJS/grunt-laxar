/**
 * Copyright 2014 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
var grunt = require( 'grunt' );
var helper = require( '../lib/test_helper' );

describe( 'the directory_tree task', function() {

   'use strict';

   var task = 'directory_tree';

   describe( 'when using the default configuration', function() {
      var config = {
         src: [
            'tasks/spec/fixtures/**/*.js'
         ],
         dest: 'tmp/directory_tree_default.json'
      };

      beforeEach( helper.runMultiTaskWithConfig.bind( null, task, config ) );

      it( 'creates a json file containing the requested mapping', function() {
         var actual = grunt.file.readJSON('tmp/directory_tree_default.json');
         var expected = grunt.file.readJSON('tasks/spec/expected/directory_tree_default.json');

         expect( actual ).toEqual( expected );
      } );

   } );

   describe( 'when using the `base` option', function() {
      var config = {
         options: {
            base: 'tasks/spec/fixtures'
         },
         src: [
            'tasks/spec/fixtures/**/*.js'
         ],
         dest: 'tmp/directory_tree_basedir.json'
      };

      beforeEach( helper.runMultiTaskWithConfig.bind( null, task, config ) );

      it( 'creates a json file containing the requested mapping', function() {
         var actual = grunt.file.readJSON('tmp/directory_tree_basedir.json');
         var expected = grunt.file.readJSON('tasks/spec/expected/directory_tree_basedir.json');

         expect( actual ).toEqual( expected );
      } );

   } );

} );
