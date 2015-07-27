/**
 * Copyright 2015 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
module.exports = function( grunt ) {
   'use strict';
   require( './deprecated/directory_tree' )( grunt );
   require( './deprecated/css_merger' )( grunt );
   require( './deprecated/upgrade_pages' )( grunt );
   require( './deprecated/laxar_application_dependencies' )( grunt );
   require( './deprecated/test_results_merger' )( grunt );
   require( './deprecated/widget' )( grunt );
};
