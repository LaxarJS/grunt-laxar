/**
 * Copyright 2014 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
var fs = require( 'fs' );
var minimatch = require( 'minimatch' );
var grunt = require( 'grunt' );
var Q = require( 'q' );

/**
 * Take a list of files and represent the directory tree
 * as a javascript object.
 *
 * @param {Object} grunt
 *    the grunt api for file globbing
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
   var subtree;
   var separator = require( 'path' ).sep;
   var path;
   var name;
   var promises = [];
   var j;

   for( var i = 0; i < filelist.length; i += 1 ) {
      subtree = tree;
      path = filelist[ i ].split( separator );

      for( j = 0; j < path.length - 1; j += 1 ) {
         name = path[ j ];
         if( typeof subtree[ name ] === 'undefined' ) {
            subtree[ name ] = {};
         }
         subtree = subtree[ name ];
      }

      name = path[j];

      /*jshint -W083*/
      promises.push( ( function( filepath, subtree, name ) {
         // Note: Q.nfcall handles errors, so we get the stat object
         // as the first argument instead of the err object.
         var fullPath = base + separator + filepath;
         return Q.nfcall( fs.stat, fullPath ).then( function( stat ) {
            if( stat.isDirectory() ) {
               subtree[ name ] = TYPE_DIRECTORY;
            }
            else if( stat.isFile() ) {

               subtree[ name ] = doEmbed( filepath ) ? fileContents( fullPath ) : TYPE_FILE;
            }
            else {
               subtree[ name ] = undefined;
            }
         } );
      }( filelist[i], subtree, name ) ) );

   }

   return Q.all( promises ).then( function() {
      callback( null, tree );
   } ).catch( callback );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function doEmbed( filepath ) {
      function matches( pattern ) { return minimatch( filepath, pattern ); }
      return includePatterns.some( matches ) && excludePatterns.every( matches );
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function fileContents( filepath ) {
      var type = filepath.substring( filepath.lastIndexOf( '.' ) + 1 );
      if( type === 'json' ) {
         // Eliminate whitespace by re-serializing:
         try {
            return JSON.stringify( JSON.parse( fs.readFileSync( filepath, 'utf8' ) ) );
         }
         catch( e ) {
            grunt.log.error( 'mktree: JSON.parse: Syntax error in "', filepath + '": ' + e.message );
            return '{}';
         }
      }
      if( type === 'html' ) {
         // Eliminate (some) whitespace:
         return fs.readFileSync( filepath, 'utf8' ).replace( /\n[ ]*/g, ' ' );
      }
      return fs.readFileSync( filepath, 'utf8' );
   }
};
