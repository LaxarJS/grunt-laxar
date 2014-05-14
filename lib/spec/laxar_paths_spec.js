/**
 * Copyright 2014 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
var path = require( 'path' );
var laxarPaths = require( '../laxar_paths' );

describe( 'laxarPaths( config, [options] )', function() {
   'use strict';

   describe( 'when called with a require configuration', function() {
      var paths;

      beforeEach( function() {
         paths = laxarPaths( {
            baseUrl: __dirname,
            paths: {
               'laxar-path-root': 'root',
               'laxar-path-themes': 'root/themes',
               'laxar-path-layouts': 'root/layouts',
               'laxar-path-widgets': 'root/widgets',
               'laxar-path-pages': 'root/pages',
               'laxar-path-flow': 'root/flow.json'
            },
            packages: [
               {
                   name: 'laxar_uikit',
                   location: 'root/lib/laxar_uikit',
                   main: 'laxar_uikit'
               }
            ]
         } );
      } );


      it( 'resolves the laxar path constants with the given require configuration', function() {
         expect( paths.PRODUCT ).toEqual( path.join( __dirname, 'root' ) );
         expect( paths.THEMES ).toEqual( path.join( __dirname, 'root/themes' ) );
         expect( paths.LAYOUTS ).toEqual( path.join( __dirname, 'root/layouts' ) );
         expect( paths.WIDGETS ).toEqual( path.join( __dirname, 'root/widgets' ) );
         expect( paths.PAGES ).toEqual( path.join( __dirname, 'root/pages' ) );
         expect( paths.FLOW_JSON ).toEqual( path.join( __dirname, 'root/flow.json' ) );
         expect( paths.DEFAULT_THEME ).toEqual( path.join( __dirname, 'root/lib/laxar_uikit/themes/default.theme' ) );
      } );

   } );

} );

