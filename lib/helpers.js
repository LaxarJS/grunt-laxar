/**
 * Copyright 2015 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
( function() {
   'use strict';

   var path = require( 'path' );
   var fs = require( 'fs' );
   var q = require( 'q' );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   module.exports = {
      fileExists: fileExists,
      flatten: flatten,
      lookup: lookup,
      once: once,
      promiseOnce: promiseOnce
   };

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


} )();
