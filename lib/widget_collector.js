/**
 * Copyright 2014 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
var path = require( 'path' );
var q = require( 'q' );

exports.create = function( httpClient, widgetsRoot, pageLoader ) {
   'use strict';

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function gatherWidgetsAndControls( pathToWidgets, pathToFlow ) {
      var knownControls = {};
      return findWidgetsFromFlow( pathToFlow )
         .then( function( widgets ) {
            return getWidgetSpecifications( pathToWidgets, widgets );
         } )
         .then( function( widgetInfos ) {
            var widgetPaths = {};
            var controlPaths = [];

            var promises = widgetInfos.map( function( widgetInfo ) {

               var name = widgetInfo.dir.split( '/' ).pop();
               var technology = determineWidgetTechnology( widgetInfo.specification );
               if( !( technology in widgetPaths ) ) {
                  widgetPaths[ technology ] = [];
               }
               widgetPaths[ technology ].push( path.join( widgetsRoot, widgetInfo.dir, name ) );

               return findControlsForWidget( pathToWidgets, widgetInfo.dir )
                  .then( function( controlReferences ) {
                     controlReferences.forEach( function( ref ) {
                        if( !( ref in knownControls ) ) {
                           controlPaths.push( ref );
                           knownControls[ ref ] = true;
                        }
                     } );
                  } );
            } );

            return q.all( promises ).then( function() {
               return {
                  widgets: widgetPaths,
                  controls: controlPaths
               };
            } );
         } );
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function getWidgetSpecifications( pathToWidgets, widgets ) {
      return q.all( widgets.map( function( widgetDir ) {
         return readWidgetJson( pathToWidgets, widgetDir )
            .then( function( specification ) {
               return {
                  dir: widgetDir,
                  specification: specification
               };
            } );
      } ) );
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function findControlsForWidget( pathToWidgets, widgetDir ) {
      return readWidgetJson( pathToWidgets, widgetDir )
         .then( function( specification ) {
            return specification.controls || [];
         },
         function( e ) {
            throw new Error( 'Could not load widget.json for widget ' + widgetDir, e );
         } );
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
                  pageWidgets.forEach( pushUniquely.bind( null, widgets ) );
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

            Object.keys( flow.places )
               .filter( function( key ) { return !!flow.places[ key ].page; } )
               .map( function( key ) { return flow.places[ key ].page; } )
               .forEach( pushUniquely.bind( null, pages ) );

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
               page.areas[ key ]
                  .map( function( entry ) { return entry.widget; } )
                  .forEach( pushUniquely.bind( null, widgets ) );
            } );

            return widgets;
         }
      );
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   var cachedPromises = {};
   function readWidgetJson( pathToWidgets, widgetDir ) {
      var widgetJsonPath = path.join( pathToWidgets, widgetDir, 'widget.json' );
      if( !( widgetJsonPath in cachedPromises ) ) {
         cachedPromises[ widgetJsonPath ] = httpClient.get( widgetJsonPath )
            .then( function( response ) {
               return response.data;
            } );
      }

      return cachedPromises[ widgetJsonPath ];
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function determineWidgetTechnology( specification ) {
      if( !( 'technology' in specification.integration ) ) {
         return 'angular';
      }

      return specification.integration.technology;
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function pushUniquely( array, item ) {
      if( array.indexOf( item ) === -1 ) {
         array.push( item );
      }
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   return {

      gatherWidgetsAndControls: gatherWidgetsAndControls

   };

};

