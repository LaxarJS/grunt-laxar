/**
 * Copyright 2014 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
var path = require( 'path' );
var fs = require( 'fs' );
var minimatch = require( 'minimatch' );
var Q = require( 'q' );

/**
 * Take a list of files and represent the directory tree
 * as a javascript object.
 *
 * @param {String} base
 *    the base directory for files
 * @param {Array} filelist
 *    a list of filenames
 * @param {Array} embed
 *    a list of glob patterns for files to embed
 * @param {Function} callback
 *    a nodejs style callback taking an error instance as
 *    the first parameter or the directory tree as the second
 *
 * @return {Object}
 *    the promise of the whole operation
 */
module.exports = function mktree( base, filelist, embed, callback ) {
   'use strict';

   var TYPE_DIRECTORY = 0;
   var TYPE_FILE = 1;

   embed = embed || [];
   var includePatterns = embed.filter( function( pattern ) { return pattern.indexOf( '!' ) !== 0; } );
   var excludePatterns = embed.filter( function( pattern ) { return pattern.indexOf( '!' ) === 0; } );

   var tree = {};

   var promises = filelist.map( path.normalize ).map( function( file ) {
      var parts = file.split( path.sep );
      var name = parts.splice( parts.length - 1 )[ 0 ];
      var subtree = parts.reduce( function( subtree, name ) {
         if( typeof subtree[ name ] === 'undefined' ) {
            subtree[ name ] = {};
         }
         return subtree[ name ];
      }, tree );

      return fileEntry( file ).then( function( entry ) {
          subtree[ name ] = entry;
      } );
   } );

   return Q.all( promises ).then( function() {
      callback( null, tree );
   }, callback );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function fileEntry( file ) {
      var fullPath = path.join( base, file );

      return Q.nfcall( fs.stat, fullPath ).then( function( stat ) {
         if( stat.isDirectory() ) {
            return TYPE_DIRECTORY;
         }
         else if( stat.isFile() ) {
            return doEmbed( file ) ? fileContents( fullPath ) : TYPE_FILE;
         }
         else {
            return undefined;
         }
      } );
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function doEmbed( file ) {
      function matches( pattern ) { return minimatch( file, pattern ); }
      return includePatterns.some( matches ) && excludePatterns.every( matches );
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function fileContents( file ) {
      var type = path.extname( file );
      var data = Q.nfcall( fs.readFile, file, 'utf8' );

      if( type === '.json' ) {
         // Eliminate whitespace by re-serializing:
         data = data.then( JSON.parse ).then( JSON.stringify );
      }
      if( type === '.html' ) {
         // Eliminate (some) whitespace:
         data = data.then( function( data ) { return data.replace( /[\n\r ]+/g, ' ' ); } );
      }

      return data.catch( function( e ) {
         var error = new Error( 'Failed to embed ' + file + ': ' + e.message );
         error.path = file;
         throw error;
      } );
   }

};
