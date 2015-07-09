/**
 * Copyright 2014 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
module.exports = function( grunt, taskName ) {
   'use strict';

   var path = require( 'path' );
   var fs = require( 'fs' );
   var q = require( 'q' );

   var ARTIFACTS = path.join( 'tooling', 'artifacts.json' );

   return {
      ARTIFACTS_FILE: ARTIFACTS,
      artifactsListing: artifactsListing,
      getResourcePaths: getResourcePaths,
      flatten: flatten,
      fileExists: fileExists,
      lookup: lookup,
      once: once,
      promiseOnce: promiseOnce,
      writeIfChanged: writeIfChanged
   };

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function artifactsListing( src, flowId ) {
      if( !flowId ) {
         grunt.log.error( taskName + ': named sub-task is required!' );
         return;
      }
      var source = path.join( src, flowId, ARTIFACTS );
      if( !grunt.file.exists( source ) ) {
         grunt.log.error( taskName + ': No artifact list! Run laxar-artifacts:' + flowId + ' first.' );
         return {};
      }
      return grunt.file.readJSON( source );
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   /**
    * Generate a function that maps artifacts to resource paths (to watch, list or embed),
    * taking into account the available themes.
    *
    * Note: when asking for `list` paths, `embed` paths will be included (embedding implies listing)!
    * This spares artifact developers from specifying embedded resources twice.
    *
    * @param {Array<Object>} themes
    *   a list of themes, each with a `name` property (e.g. `'default.theme'`)
    * @param {string} resourceType
    *   the type of resource
    *
    * @return {Function<string, Array<string>>}
    *   a function to provide the desired resource paths for the given artifact
    */
   function getResourcePaths( themes, resourceType ) {
      return function( artifact ) {
         var paths = extract( artifact, resourceType );
         if( resourceType === 'list' ) {
            // Embedding implies listing:
            return paths.concat( extract( artifact, 'embed' ) );
         }
         return paths;
      };

      function extract( artifact, type ) {
         if( !artifact.resources || !artifact.resources[ type ] ) {
            return [];
         }
         return flatten( artifact.resources[ type ].map( expandThemes ) ).map( fixPaths );

         function expandThemes( pattern ) {
            var isThemed = 0 === pattern.indexOf( '*.theme' + path.sep );
            return isThemed ? themes.map( substituteTheme( pattern ) ) : [ pattern ];
         }

         function fixPaths( pattern ) {
            var isSelf = pattern === '.';
            var isAbsolute = 0 === pattern.indexOf( path.sep );
            return isSelf ? artifact.path : (
               isAbsolute ? pattern.substring( 1 ) : path.join( artifact.path, pattern )
            );
         }
      }
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function fileExists( path ) {
      return q.nfcall( fs.open, path, 'r' ).then(
         function() { return true; },
         function() { return false; }
      );
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function flatten( arrays ) {
      return [].concat.apply( [], arrays );
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function lookup( object ) {
      return function( key ) {
         return object[ key ];
      };
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   /**
    * Decorate a function so that each input is processed only once.
    * Subsequent calls will return an empty array.
    * @param {Function} f
    *   The function to decorate.
    *   Should take a string and return an array.
    */
   function once( f ) {
      var inputs = {};
      return function( input ) {
         if( inputs[ input ] ) {
            return [];
         }
         inputs[ input ] = true;
         return f( input );
      };
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   /**
    * Decorate a function so that each input is processed only once.
    * Subsequent calls will return a (resolved) promise for an empty array.
    * @param {Function} f
    *   The function to decorate.
    *   Should take a string and return a promise for an array.
    */
   function promiseOnce( f ) {
      var inputs = {};
      return function( input ) {
         if( inputs[ input ] ) {
            return q.when( [] );
         }
         inputs[ input ] = true;
         return f( input );
      };
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function substituteTheme( pattern ) {
      return function( theme ) {
         var segments = pattern.split( path.sep );
         segments[ 0 ] = theme.name;
         return segments.join( path.sep );
      };
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   /** Write task results only if something changed, so that watchers are only triggered if needed */
   function writeIfChanged( resultsPath, newResults, startMs ) {
      // make sure that all generated text files end in a newline:
      if( newResults.charAt( newResults.length - 1 ) !== '\n' ) {
         newResults += '\n';
      }

      var previous = '';
      try {
         previous = grunt.file.read( resultsPath, { encoding: 'utf-8' } );
      }
      catch( e ) { /* OK, probably the first run */ }

      var hasChanged;
      var words;
      if( previous !== newResults ) {
         grunt.file.write( resultsPath, newResults );
         hasChanged = true;
         words = grunt.log.wordlist( [ 'wrote', resultsPath ], { color: 'cyan' } );
      }
      else {
         hasChanged = false;
         words = grunt.log.wordlist( [ 'unchanged', resultsPath ], { color: 'green' } );
      }

      var endMs = Date.now() - startMs;
      grunt.log.ok( taskName + ': ' + words + ' (' + endMs + 'ms)' );
      return hasChanged;
   }

};
