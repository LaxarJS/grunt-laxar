/**
 * Copyright 2014 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
/*jshint node: true*/
module.exports = function( config, options ) {
   'use strict';

   var requirejs = require( 'requirejs' ).config( config );
   var path = require( 'path' );

   var PageLoader = requirejs( path.join( options.laxar, 'lib/portal/portal_assembler/page_loader' ) );

   var q_;
   var httpClient_;
   var widgetsRoot_;

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function gatherWidgetsAndControls( pathToPages, pathToWidgets, pathToFlow ) {
      var knownControls = {};
      return findWidgetsFromFlow( pathToPages, pathToFlow )
         .then( function( widgets ) {
            var requires = [];
            var promises = [];

            widgets.forEach( function( widget ) {
               var pathFragments = widget.split( '/' );
               var name = pathFragments[ pathFragments.length - 1 ];

               requires.push( path.join( widgetsRoot_, widget, name ) );
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

            return q_.all( promises ).then( function() {
               return {
                  requires: requires
               };
            } );
         } );
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function findControlsForWidget( pathToWidgets, widgetReference ) {
      var url = path.join( pathToWidgets, widgetReference, 'widget.json' );
      return httpClient_.get( url ).then(
         function( spec ) {
            return spec.data.controls || [];
         },
         function( e ) {
            throw new Error( 'Could not load widget.json for widget ' + widgetReference, e );
         }
      );
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function findWidgetsFromFlow( pathToPages, pathToFlow ) {
      return findPagesFromFlow( pathToFlow ).then( function( pages ) {
         var promises = pages.map( function( page ) {
            return findWidgetsFromPage( pathToPages, page );
         } );

         return q_.all( promises )
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
      return httpClient_.get( pathToFlow )
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

   function findWidgetsFromPage( pathToPages, pageLink ) {
      var pageLoader = PageLoader.create( q_, httpClient_, pathToPages );

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

      init: function( q, httpClient, widgetsRoot ) {
         q_ = q;
         httpClient_ = httpClient;
         widgetsRoot_ = widgetsRoot;
      },

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      gatherWidgetsAndControls: gatherWidgetsAndControls

   };

};
