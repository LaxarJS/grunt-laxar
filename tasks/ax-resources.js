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
   var path = require( '../lib/path-platform/path' ).posix;

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
            return preprocessJson( contents );
         }
         if( type === '.html' ) {
            // Eliminate (some) whitespace:
            return contents.replace( /[\n\r ]+/g, ' ' );
         }
         return contents;
      }

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      function preprocessJson( jsonContents ) {
         var contents = JSON.parse( jsonContents );
         if( typeof( contents ) === 'object' && !Array.isArray( contents ) ) {
            if( contents.features && contents.features.$schema ) {
               optimizeSchema( contents.features, 0 );
               if( contents.name === 'topic-controller-activity' ) {
                  grunt.log.writeln( 'OPT: ' );
                  grunt.log.writeln( 'OPT: ' );
                  grunt.log.writeln( 'OPT: ' + JSON.stringify( contents, null, 3 ) );
                  return JSON.stringify( contents );
               }
            }
         }
         return JSON.stringify( JSON.parse( jsonContents ) );
      }

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      /**
       * Optimize a json schema for production, in-place.
       *
       * - Recursively prune all child branches that do not lead to defaults
       * - At leaves, remove everything but the defaults
       *
       * @return {Boolean}
       *   `true` if this entire branch can be pruned from the schema, because it does not contain defaults,
       *   `false` otherwise.
       */
      function optimizeSchema( schema, level ) {
         if( !schema ) {
            return true;
         }

         function optimizeOrDelete( container, schemaKey ) {
            var branchNeeded = optimizeSchema( container[ schemaKey ], level+1 );
            if( !branchNeeded ) {
               delete container[ schemaKey ];
            }
            return branchNeeded;
         }

         function optimizeOrSplice( container, index ) {
            var branchNeeded = optimizeSchema( container[ index ], level+1 );
            if( !branchNeeded ) {
               container.splice( index, 1 );
            }
            return branchNeeded;
         }

         var schemaNeeded = false;
         if( schema.type === 'object' ) {
            Object.keys( schema.properties || {} ).forEach( function( key ) {
               schemaNeeded = optimizeOrDelete( schema.properties, key ) || schemaNeeded;
            } );

            Object.keys( schema.patternProperties || {} ).forEach( function( key ) {
               schemaNeeded = optimizeOrDelete( schema.patternProperties, key ) || schemaNeeded;
            } );

            if( schema.hasOwnProperty( 'additionalProperties' ) ) {
               schemaNeeded = optimizeOrDelete( schema, 'additionalProperties' ) || schemaNeeded;
            }

            // Top-level defaults must always be inferable
            if( level <= 1 && !schema.hasOwnProperty( 'default' ) ) {
               schema.default = {};
               schemaNeeded = true;
            }
         }

         if( schema.type === 'array' ) {
            if( Array.isArray( schema.items ) ) {
               schema.items.forEach( function( i ) {
                  schemaNeeded = optimizeOrSplice( schema.items, i ) || schemaNeeded
               } );
            }
            else {
               schemaNeeded = optimizeOrDelete( schema, 'items' ) || schemaNeeded;
            }

            // Top-level defaults must always be inferable
            if( level <= 1 && !schema.hasOwnProperty( 'default' ) ) {
               schema.default = [];
               schemaNeeded = true;
            }
         }

         if( schema.type === 'string' ) {
            delete schema.format;
         }

         delete schema.axPattern;
         delete schema.axRole;
         delete schema.description;
         if( level > 1 ) {
            delete schema.type;
         }

      }
   }

};
