/**
 * Copyright 2014 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
module.exports = function loadNpmTasks( grunt, module ) {
   'use strict';

   var path = require( 'path' );
   var findup = require( 'findup' );
   var tasks = path.join( 'node_modules', module, 'tasks' );
   var plugin = findup.sync( __dirname, tasks );

   grunt.loadTasks( path.join( plugin, tasks ) );
};
