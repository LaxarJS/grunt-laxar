/**
 * Copyright 2014 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
/*jshint node: true*/
module.exports = function loadNpmTasks( grunt, module ) {
   'use strict';

   var path = require( 'path' );
   var tasks = path.join( __dirname, '../../node_modules', module, 'tasks' );

   grunt.loadTasks( tasks );
};
