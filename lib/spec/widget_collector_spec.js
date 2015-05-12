/**
 * Copyright 2014 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
var WidgetCollector = require( '../widget_collector' );
var path = require( 'path' );
var q = require( 'q' );

describe( 'WidgetCollector', function() {
   'use strict';

   var resolved;
   var rejected;

   ////////////////////////////////////////////////////////////////////////////////////////////////////////

   beforeEach( function( done ) {

      var pages = {
         page1: {
            layout: 'someLayout',

            areas: {
               area1: [
                  { widget: 'someWidgetPath1', id: 'id1' },
                  { widget: 'someWidgetPath2', id: 'id2' },
                  { widget: 'someWidgetPath3', id: 'id3' }
               ],
               area2: [
                  { widget: 'someWidgetPath1', id: 'id4' },
                  { widget: 'someWidgetPath2', id: 'id5' }
               ],
               area3: [
                  { widget: 'someWidgetPath3', id: 'id6' },
                  { widget: 'someWidgetPath4', id: 'id7' }
               ]
            }
         }
      };

      var httpClient = {
         get: function( url ) {
            var deferred = q.defer();

            process.nextTick( function() {
               if( httpClient.responses.hasOwnProperty( url ) ) {
                  deferred.resolve( { data: httpClient.responses[ url ] } );
               } else {
                  deferred.reject( {} );
               }
            } );

            return deferred.promise;
         },
         responses: {},
         respondWith: function( url, data ) {
            httpClient.responses[ url ] = data;
         }
      };

      var pageLoader = {
         loadPage: function( page ) {
            var deferred = q.defer();

            process.nextTick( function() {
               if( pages.hasOwnProperty( page ) ) {
                  deferred.resolve( pages[ page ] );
               } else {
                  deferred.reject( {} );
               }
            } );

            return deferred.promise;
         }
      };

      var flow = { places: {} };

      Object.keys( pages ).forEach( function( pageName ) {
         httpClient.respondWith( 'pages/' + pageName + '.json', pages[ pageName ] );
         flow.places[ pageName ] = { page: pageName, targets: {} };
      } );
      var angularIntegration = { technology: 'angular' };
      var plainIntegration = { technology: 'plain' };
      httpClient.respondWith( 'flow.json', flow );
      httpClient.respondWith( 'w/someWidgetPath1/widget.json', { integration: angularIntegration } );
      httpClient.respondWith( 'w/someWidgetPath2/widget.json', { integration: angularIntegration } );
      httpClient.respondWith( 'w/someWidgetPath3/widget.json', { integration: plainIntegration } );
      httpClient.respondWith( 'w/someWidgetPath4/widget.json', {
         integration: angularIntegration,
         controls: [ 'my_ui_package/someControl' ]
      } );

      var requirejsMock = {
         toUrl: function( arg ) { return arg; }
      };
      var widgetCollector = WidgetCollector.create( requirejsMock, httpClient, 'my_widgets', pageLoader );
      widgetCollector.gatherWidgetsAndControls( 'w', 'flow.json' )
         .then( function( data ) {
            resolved = data;
         }, function( data ) {
            rejected = data;
         } )
         .then( done )
         .catch( done );

   } );

   ////////////////////////////////////////////////////////////////////////////////////////////////////////

   it( 'finds all widgets in a page declaration', function() {
      expect( rejected ).toBeFalsy();
      expect( resolved ).toEqual( {
         widgets: {
            angular: [
               'my_widgets/someWidgetPath1/someWidgetPath1',
               'my_widgets/someWidgetPath2/someWidgetPath2',
               'my_widgets/someWidgetPath4/someWidgetPath4'
            ],
            plain: [
               'my_widgets/someWidgetPath3/someWidgetPath3'
            ]
         },
         controls: [
            'my_ui_package/someControl'
         ]
      } );
   } );

} );
