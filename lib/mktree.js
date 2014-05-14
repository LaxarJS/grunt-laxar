/**
 * Copyright 2014 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
var fs = require( 'fs' );
var Q = require( 'q' );

/**
 * Take a list of files and represent the directory tree
 * as a javascript object.
 *
 * @param {String} base
 *    the base directory for files
 * @param {Array} filelist
 *    a list of filenames
 * @param {Function} callback
 *    a nodejs style callback taking an error instance as
 *    the first parameter or the directory tree as the second
 *
 * @return {Object}
 *    the promise of the whole operation
 */
module.exports = function mktree( base, filelist, callback ) {
   'use strict';

   var tree = {};
   var subtree;
   var separator = require( 'path' ).sep;
   var path;
   var name;
   var deferred;
   var promises = [];
   var j;

   for( var i = 0; i < filelist.length; i += 1 ) {
      subtree = tree;
      path = filelist[i].split( separator );

      for( j = 0; j < path.length - 1; j += 1 ) {
         name = path[j];
         if( typeof subtree[name] === 'undefined' ) {
            subtree[name] = {};
         }

         subtree = subtree[name];
      }

      name = path[j];

      /*jshint -W083*/
      promises.push( ( function( filepath, subtree, name ) {
         // Note: Q.nfcall handles errors, so we get the stat object
         // as the first argument instead of the err object.
         return Q.nfcall( fs.stat, base + separator + filepath ).then( function( stat ) {
            if( stat.isDirectory() ) {
               subtree[name] = 'directory';
            }
            else if( stat.isFile() ) {
               subtree[name] = 'file';
            }
            else {
               subtree[name] = undefined;
            }
         } );
      }( filelist[i], subtree, name ) ) );

   }

   return Q.all( promises ).then( function() {
      callback( null, tree );
   } ).catch( callback );
};
