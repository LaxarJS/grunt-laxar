/**
 * Copyright 2015 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
module.exports = function( grunt ) {
   'use strict';

   var TASK = 'laxar-resources';
   var RESOURCES_FILE = 'resources.json';

   var fs = require( 'fs' );
   var q = require( 'q' );
   var path = require( 'path' );

   var readFile = q.nfbind( fs.readFile );

   var helpers = require( './lib/task_helpers' )( grunt, TASK );
   var flatten = helpers.flatten;
   var lookup = helpers.lookup;
   var fileExists = helpers.fileExists;

   grunt.registerMultiTask( TASK,
      'Generate a resource listing for the LaxarJS runtime to determine which resources are available.',
      function() { runResources( this ); }
   );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function runResources( task ) {

      var startMs = Date.now();
      var done = task.async();

      var flowId = task.nameArgs.split( ':' )[ 1 ];
      var flowsDirectory = task.files[ 0 ].src[ 0 ];
      var options = task.options( {
         embed: true
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      var artifacts = helpers.artifactsListing( flowsDirectory, flowId );
      var artifactList = flatten( Object.keys( artifacts ).map( lookup( artifacts ) ) );

      var listings = {};
      var listingPromises = artifactList.filter( hasListing )
         .map( artifactProcessor( listings, artifacts.themes ) );

      // wait for all file-embeddings
      q.all( listingPromises ).then( function() {
         var results = normalize( listings );
         helpers.writeIfChanged(
            path.join( flowsDirectory, flowId, RESOURCES_FILE ),
            JSON.stringify( results, null, 3 ),
            startMs
         );
         done();
      } )
      .catch( function( err ) {
         grunt.log.error( TASK + ': ERROR:', err );
         done( err );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      function normalize( listing ) {
         if( typeof( listing ) !== 'object' ) {
            return listing;
         }
         var keys = Object.keys( listing );
         keys.sort();
         var result = {};
         keys.forEach( function( key ) {
            result[ key ] = normalize( listing[ key ] );
         } );
         return result;
      }

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      function hasListing( artifact ) {
         return artifact.resources && ( artifact.resources.list || artifact.resources.embed );
      }

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      function artifactProcessor( listings, themes ) {

         var getPathsToEmbed = helpers.getResourcePaths( themes, 'embed' );
         var getPathsToList = helpers.getResourcePaths( themes, 'list' );

         var processed = {};

         return function process( artifact ) {
            var embedPromise = options.embed ?
               q.all( getPathsToEmbed( artifact ).map( embed ) ) :
               q.when( [] );

            // Order matters, since knownMissing is tracked as a side-effect:
            return embedPromise.then( function() {
               return q.all( getPathsToList( artifact ).map( listIfExists ) );
            } );
         };

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         function embed( filePath ) {
            if( processed[ filePath ] ) {
               return;
            }

            processed[ filePath ] = true;
            return readFile( filePath, 'utf-8' ).then( function( contents ) {
               insertRecursively( listings, filePath.split( path.sep ), preprocess( filePath, contents ) );
            } ).catch( function( err ) {
               if( err.code !== 'ENOENT' ) { throw err; }
            } );
         }

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         function list( filePath ) {
            return insertRecursively( listings, filePath.split( path.sep ), 1 );
         }

         function listIfExists( filePath ) {
            if( processed[ filePath ] ) {
               return q.when();
            }
            processed[ filePath ] = true;
            return fileExists( filePath ).then( function( exists ) {
               return exists ? list( filePath ) : [];
            } );
         }

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         function insertRecursively( node, segments, value ) {
            var segment = segments.shift();
            if( !segments.length ) {
               node[ segment ] = value;
               return;
            }
            var child = node[ segment ] = ( node[ segment ] || {} );
            insertRecursively( child, segments, value  );
         }

      }

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      function preprocess( filePath, contents ) {
         var type = path.extname( filePath );
         if( type === '.json' ) {
            // Eliminate whitespace by re-serializing:
            return JSON.stringify( JSON.parse( contents ) );
         }
         if( type === '.html' ) {
            // Eliminate (some) whitespace:
            return contents.replace( /[\n\r ]+/g, ' ' );
         }
         return contents;
      }

   }

};
