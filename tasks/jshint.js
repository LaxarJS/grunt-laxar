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
   var jshintrc = path.resolve( __dirname + '/../.jshintrc' );

   grunt.config( 'jshint.options', _.defaults( options, { jshintrc: jshintrc } ) );

   load( grunt, 'grunt-contrib-jshint' );
};
