/**
 * Copyright 2014 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
var WidgetCollector = require( '../widget_collector' );
var fs = require( 'fs' );
var path = require( 'path' );
var q = require( 'q' );

describe( 'WidgetCollector', function() {
   'use strict';

   var resolved;
   var rejected;

   ////////////////////////////////////////////////////////////////////////////////////////////////////////

   beforeEach( function( done ) {
      var pageLoaderMock = {
         loadPage: function( page ) {
            var readFile = q.nfbind( fs.readFile );
            return readFile( path.join( __dirname, 'data', page + '.json' ) ).then( JSON.parse );
         }
      };

      var requirejsMock = {
         toUrl: function( arg ) {
            if( arg.indexOf( 'laxar-path-controls' ) === 0 ) {
               return arg.replace( 'laxar-path-controls', path.join( __dirname, 'data' ) );
            }

            return arg;
         }
      };
      var pathToWidgets = path.join( __dirname, 'data/widgets' );
      var pathToFlow = path.join( __dirname, 'data/flow.json' );
      var widgetCollector =
         WidgetCollector.create( requirejsMock, 'laxar-application/includes/widgets', pageLoaderMock );

      widgetCollector.gatherWidgetsAndControls( pathToWidgets, pathToFlow )
         .then( function( data ) {
            resolved = data;
         }, function( data ) {
            rejected = data;
         } )
         .then( done )
         .catch( done );
   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   it( 'finds all widgets in a page declaration', function() {
      expect( rejected ).toBeFalsy();
      expect( resolved.widgets ).toEqual( [
         'laxar-application/includes/widgets/widget1/widget1',
         'laxar-application/includes/widgets/widget2/widget2',
         'laxar-application/includes/widgets/widget3/widget3',
         'laxar-application/includes/widgets/widget4/widget4'
      ] );
   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   it( 'finds all controls referenced by widgets', function() {
      expect( rejected ).toBeFalsy();
      expect( resolved.controls ).toEqual( [
         'my_ui_package/someControl',
         'laxar-path-controls/test-control/test-control'
      ] );
   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   it( 'provides a method to get the descriptor of a widget by path', function() {
      expect( resolved.descriptorForWidget( 'laxar-application/includes/widgets/widget3/widget3' ) )
         .toEqual( { 'integration': { 'technology': 'plain' } } );
   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   it( 'provides a method to get the descriptor of a control by path', function() {
      expect( resolved.descriptorForControl( 'laxar-path-controls/test-control/test-control' ) )
         .toEqual( { name: 'TestControl', 'integration': { 'technology': 'angular' } } );

      expect( resolved.descriptorForControl( 'my_ui_package/someControl' ) )
         .toEqual( { 'integration': { 'technology': 'angular' }, isLegacy: true } );
   } );

} );
