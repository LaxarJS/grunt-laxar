/**
 * Copyright 2014 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
var laxarPaths = require( '../laxar_paths' );

describe( 'laxarPaths( config, [options] )', function() {
   'use strict';

   describe( 'when called with a require configuration', function() {
      var paths;
      var baseUrl = '.';

      beforeEach( function() {
         paths = laxarPaths( {
            baseUrl: baseUrl,
            paths: {
               'laxar-path-root': 'root',
               'laxar-path-themes': 'root/themes',
               'laxar-path-layouts': 'root/layouts',
               'laxar-path-widgets': 'root/widgets',
               'laxar-path-pages': 'root/pages',
               'laxar-path-flow': 'root/flow.json',
               'laxar-path-default-theme': 'root/components/uikit/default.theme'
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
         expect( paths.PRODUCT ).toEqual( baseUrl + '/root' );
         expect( paths.THEMES ).toEqual( baseUrl + '/root/themes' );
         expect( paths.LAYOUTS ).toEqual( baseUrl + '/root/layouts' );
         expect( paths.WIDGETS ).toEqual( baseUrl + '/root/widgets' );
         expect( paths.PAGES ).toEqual( baseUrl + '/root/pages' );
         expect( paths.FLOW_JSON ).toEqual( baseUrl + '/root/flow.json' );
         expect( paths.DEFAULT_THEME ).toEqual( baseUrl + '/root/components/uikit/default.theme' );
      } );

   } );

} );

