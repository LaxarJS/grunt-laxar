/**
 * Copyright 2014 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */

/* global expect */
require( 'expectations' );

var path = require( 'path' );
var requireConfig = require( '../require_config' );

describe( 'requireConfig( file, [options] )', function() {
   'use strict';


   function common( configFile, options ) {
      var config;

      beforeEach( function() {
         config = requireConfig( path.join( __dirname, configFile ), options );
      } );

      it( 'reads the given require configuration file', function() {
         expect( config.paths.a ).toEqual( 'test_a' );
         expect( config.paths.b ).toEqual( 'test_b' );
      } );

      if( options && options.base ) {
         it( 'resolves the `baseUrl` from to the given base directory', function() {
            expect( config.baseUrl ).toEqual( path.resolve( options.base, 'test' ) );
         } );
      } else {
         it( 'resolves the `baseUrl` from the current directory', function() {
            expect( config.baseUrl ).toEqual( path.resolve( 'test' ) );
         } );
      }

      it( 'replaces paths for `q` and `underscore`', function() {
         expect( config.paths.q ).not.toEqual( 'test_q' );
         expect( config.paths.underscore ).not.toEqual( 'test_underscore' );
      } );

      it( 'removes shims for `q` and `underscore`', function() {
         expect( config.shim.q ).toBeUndefined();
         expect( config.shim.underscore ).toBeUndefined();
      } );
   }

   describe( 'when called with a configuration file that uses `var requirejs = {}`', function() {
      common( 'data/require_config_a.js' );
   } );

   describe( 'when called with a configuration file that uses `require.config({})`', function() {
      common( 'data/require_config_a.js' );
   } );

   describe( 'when called with additional options', function() {
      common( 'data/require_config_a.js', {
         base: __dirname,
         paths: {
            c: 'test_c'
         }
      } );
   } );

} );
