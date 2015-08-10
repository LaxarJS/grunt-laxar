/**
 * Copyright 2015 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
module.exports = function( grunt ) {
   'use strict';

   var TASK = 'laxar-dependencies';
   var DEPENDENCIES_FILE = 'dependencies.js';

   var fs = require( 'fs' );
   var q = require( 'q' );
   var path = require( '../lib/path-platform/path' ).posix;
   var async = require( 'async' );

   var helpers = require( './lib/task_helpers' )( grunt, TASK );

   grunt.registerMultiTask( TASK,
      'Generate an AMD-module that includes all dependencies needed by a flow.',
      function() { runDependencies( this ); }
   );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function runDependencies( self ) {

      var startMs = Date.now();
      var flowId = self.nameArgs.split( ':' )[ 1 ];
      var flowsDirectory = self.files[ 0 ].src[ 0 ];

      var modulesByTechnology = {};
      var artifacts = helpers.artifactsListing( flowsDirectory, flowId );
      artifacts.controls.concat( artifacts.widgets ).filter( hasModule ).forEach( registerModule );

      var result = generateDependenciesModule( modulesByTechnology );
      helpers.writeIfChanged( path.join( flowsDirectory, flowId, DEPENDENCIES_FILE ), result, startMs );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      function hasModule( artifact ) {
         return artifact.integration &&
                artifact.references &&
                artifact.references.amd &&
                artifact.references.amd.module;
      }

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      function registerModule( artifact ) {
         var technology = artifact.integration.technology;
         modulesByTechnology[ technology ] = modulesByTechnology[ technology ] || [];
         modulesByTechnology[ technology].push( artifact.references.amd.module );
      }

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      function generateDependenciesModule( modulesByTechnology ) {
         var dependencies = [];
         var registryEntries = [];

         Object.keys( modulesByTechnology )
            .reduce( function( start, technology ) {
               var end = start + modulesByTechnology[ technology].length;
               [].push.apply( dependencies, modulesByTechnology[ technology ] );
               registryEntries.push( '\'' + technology + '\': modules.slice( ' + start + ', ' + end + ' )' );
               return end;
            }, 0 );

         var requireString = '[\n   \'' + dependencies.join( '\',\n   \'' ) + '\'\n]';

         return 'define( ' + requireString + ', function() {\n' +
                '   \'use strict\';\n' +
                '\n' +
                '   var modules = [].slice.call( arguments );\n' +
                '   return {\n' +
                '      ' + registryEntries.join( ',\n      ' ) + '\n' +
                '   };\n' +
                '} );\n';
      }
   }

};
