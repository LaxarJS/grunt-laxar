/**
 * Copyright 2015 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
module.exports = function( grunt ) {
   'use strict';

   var TASK = 'laxar-dist-css';

   var path = require( '../lib/path-platform/path' ).posix;
   var CONFIG_FILE = path.join( 'work', 'dist-css-configuration.json' );
   var RESOURCES_FILE = 'resources.json';
   var RESULT_DIRECTORY = path.join( 'dist' );

   var DEFAULT_THEME = 'default.theme';

   var load = require( './lib/load' );
   load( grunt, 'grunt-contrib-cssmin' );

   var helpers = require( './lib/task_helpers' )( grunt, TASK );

   grunt.registerMultiTask( TASK,
      'Combines CSS stylesheets of flow artifacts using clean-css, to provide a small single-file version.',
      function() { runDistCss( this ); }
   );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function runDistCss( task ) {

      var startMs = Date.now();

      var flowId = task.nameArgs.split( ':' )[ 1 ];
      var flowsDirectory = task.files[ 0 ].src[ 0 ];
      var subTask = 'laxar-flow-' + flowId;

      var options = task.options( {
         sourceMap: true,
         rebase: true,
         target: path.join( flowsDirectory, flowId, RESULT_DIRECTORY ),
         keepSpecialComments: 0,

         saveConfig: true,
         tasks: [
            'cssmin:' + subTask
         ]
      } );

      var artifacts = helpers.artifactsListing( flowsDirectory, flowId );
      var listings = grunt.file.readJSON( path.join( flowsDirectory, flowId, RESOURCES_FILE ) );
      var config = { cssmin: {} };
      config.cssmin[ subTask ] = cssMinConfig( artifacts );

      // Write generated configuration, for inspection:
      if( options.saveConfig ) {
         var destination = path.join( flowsDirectory, flowId , CONFIG_FILE );
         var result = JSON.stringify( config, null, 3 );
         helpers.writeIfChanged( destination, result, startMs );
      }

      grunt.config( 'cssmin.' + subTask, config.cssmin[ subTask ] );

      if( options.tasks ) {
         grunt.task.run( options.tasks );
      }

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      function cssMinConfig( artifacts ) {
         var getCandidatePaths = helpers.getResourcePaths( artifacts.themes, 'list' );
         var cssArtifactTypes = [ 'widgets', 'controls', 'layouts' ];

         var files = artifacts.themes.map( collectFiles );
         return {
            files: files,
            options: options
         };

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         function collectFiles( theme ) {

            var sources = selectArtifacts( artifacts, cssArtifactTypes )
               .map( function( artifact ) {
                  var candidates = getCandidatePaths( artifact ).filter( isCss ).filter( isListed );
                  return choose( theme, candidates );
               } )
               .filter( defined );

            return {
               src: helpers.flatten( [ path.join( theme.path, 'css', 'theme.css' ) ].concat( sources ) ),
               dest: path.join( flowsDirectory, flowId, RESULT_DIRECTORY, theme.name + '.css' )
            };
         }

         function isCss( _ ) { return /.css$/.test( _ ); }
         function isListed( _ ) { return queryRecursively( listings, _.split( path.sep ) ); }
         function defined( _ ) { return _; }

         function choose( theme, candidates ) {
            var defaultCandidate = null;
            var themeCandidate = null;
            candidates.forEach( function( candidate ) {
               var segments = candidate.split( path.sep );
               if( segments.indexOf( theme.name ) !== -1 ) {
                  themeCandidate = candidate;
               }
               else if( segments.indexOf( DEFAULT_THEME ) !== -1 ) {
                  defaultCandidate = candidate;
               }
            } );
            return themeCandidate || defaultCandidate;
         }
      }

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      function queryRecursively( node, segments ) {
         var segment = segments.shift();
         if( !segments.length ) {
            return node[ segment ];
         }
         var child = node[ segment ];
         return child && queryRecursively( child, segments );
      }
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function selectArtifacts( artifacts, types ) {
      return helpers.flatten(
         ( types || Object.keys( artifacts ) ).map( helpers.lookup( artifacts ) )
      );
   }

};
