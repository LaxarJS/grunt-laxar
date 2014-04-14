/**
 * Copyright 2014 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
/*jshint node: true*/
module.exports = function( grunt ) {
   'use strict';

   var load = require( './lib/load' );
   var _ = grunt.util._;

   var options = grunt.config( 'karma.options' ) || {};
   var port = grunt.config( 'connect.options.port' ) || 8000;
   var hostname = grunt.config( 'connect.options.hostname' ) || 'localhost';

   if( hostname === '*' ) {
      hostname = 'localhost';
   }

   grunt.config( 'karma.options', _.defaults( {
      plugins: [
         require( 'karma-phantomjs-launcher' ),
         require( 'karma-junit-reporter' ),
         require( 'karma-laxar' )
     ].concat( options.plugins || [] ),
     frameworks: [
         'laxar'
     ].concat( options.frameworks || [] )
   }, options, {
      reporters: [ 'progress' ],
      browsers: [ 'PhantomJS' ],
      singleRun: true,
      baseUrl: '/karma/',
      proxies: {
         '/base': 'http://' + hostname + ':' + port
      }
   } ) );

   load( grunt, 'grunt-karma' );
};

