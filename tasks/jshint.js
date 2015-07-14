/**
 * Copyright 2014 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
module.exports = function( grunt ) {
   'use strict';

   var path = require( 'path' );
   var load = require( './lib/load' );
   var _ = grunt.util._;

   var options = grunt.config( 'jshint.options' ) || {};
   grunt.config( 'jshint.options', _.defaults( options, { jshintrc: true } ) );

   load( grunt, 'grunt-contrib-jshint' );
};
