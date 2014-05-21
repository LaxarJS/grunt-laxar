/**
 * Copyright 2014 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
var path = require( 'path' );
var q = require( 'q' );

var WidgetCollector = module.exports = {};

WidgetCollector.create = function( httpClient, widgetsRoot, pageLoader ) {
   'use strict';

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function gatherWidgetsAndControls( pathToWidgets, pathToFlow ) {
      var knownControls = {};
      return findWidgetsFromFlow( pathToFlow )
         .then( function( widgets ) {
            var requires = [];
            var promises = [];

            widgets.forEach( function( widget ) {
               var pathFragments = widget.split( '/' );
               var name = pathFragments[ pathFragments.length - 1 ];

               requires.push( path.join( widgetsRoot, widget, name ) );
               promises.push( findControlsForWidget( pathToWidgets, widget )
                  .then( function( controlReferences ) {
                     controlReferences.forEach( function( ref ) {
                        if( !( ref in knownControls ) ) {
                           requires.push( ref );
                           knownControls[ ref ] = true;
                        }
                     } );
                  }
               ) );
            } );

            return q.all( promises ).then( function() {
               return {
                  requires: requires
               };
            } );
         } );
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function findControlsForWidget( pathToWidgets, widgetReference ) {
      var url = path.join( pathToWidgets, widgetReference, 'widget.json' );
      return httpClient.get( url ).then(
         function( spec ) {
            return spec.data.controls || [];
         },
         function( e ) {
            throw new Error( 'Could not load widget.json for widget ' + widgetReference, e );
         }
      );
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function findWidgetsFromFlow( pathToFlow ) {
      return findPagesFromFlow( pathToFlow ).then( function( pages ) {
         var promises = pages.map( function( page ) {
            return findWidgetsFromPage( page );
         } );

         return q.all( promises )
            .then( function( resultsPerPage ) {
               var widgets = [];

               resultsPerPage.forEach( function( pageWidgets ) {
                  pageWidgets.forEach( function( widget ) {
                     if( widgets.indexOf( widget ) === -1 ) {
                        widgets.push( widget );
                     }
                  } );
               } );

               return widgets;
            } );
      } );
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function findPagesFromFlow( pathToFlow ) {
      return httpClient.get( pathToFlow )
         .then( function( resp ) {
            var flow = resp.data;
            var pages = [];

            Object.keys( flow.places ).forEach( function( key ) {
               var place = flow.places[ key ];
               if( place.page && pages.indexOf( place.page ) === -1 ) {
                  pages.push( place.page );
               }
            } );

            return pages;
         }
      );
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function findWidgetsFromPage( pageLink ) {

      return pageLoader.loadPage( pageLink )
         .then( function( page ) {
            var widgets = [];

            Object.keys( page.areas ).forEach( function( key ) {
               var area = page.areas[ key ];
               area.forEach( function( widget ) {
                  if( widgets.indexOf( widget ) === -1 ) {
                     widgets.push( widget.widget );
                  }
               } );
            } );

            return widgets;
         }
      );
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   return {

      gatherWidgetsAndControls: gatherWidgetsAndControls

   };

};

