/**
 * Copyright 2014 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
module.exports = function( grunt ) {
   'use strict';

   var load = require( './lib/load' );
   var _ = grunt.util._;

   var options = grunt.config( 'requirejs.options' ) || {};

   grunt.config( 'requirejs.options', _.defaults( options, {
      fileExclusionRegExp: /(^|\/)(\..*|node_modules)/,
      findNestedDependencies: true,
      optimize: 'uglify2',
      generateSourceMaps: true,
      preserveLicenseComments: false,
      pragmas: {
         debugMode: true
      }
   } ) );

   load( grunt, 'grunt-contrib-requirejs' );
};

