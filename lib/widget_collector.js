/**
 * Copyright 2014 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
var fs = require( 'fs' );
var path = require( 'path' );
var q = require( 'q' );
/**
 *
 * @param {Object} requirejs
 *    require js needed to resolve path mappings using the `toUrl` method
 * @param {String} widgetsRoot
 *    the root path to the widget location that should be returned to the laxar application
 * @param {Object} pageLoader
 *    the laxar page loader
 *
 * @return {Object}
 */
exports.create = function( requirejs, widgetsRoot, pageLoader ) {
   'use strict';

   var readFile = q.nfbind( fs.readFile );
   var widgetsRootUrl = widgetsRoot.split( path.sep ).join( '/' );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   /**
    *
    * @param {String} pathToWidgets
    *    path to the widgets for this node based collector
    * @param {String} pathToFlow
    *    path to the flow file for this node based collector
    *
    * @return {Promise}
    */
   function gatherWidgetsAndControls( pathToWidgets, pathToFlow ) {
      return findWidgetsFromFlow( pathToFlow )
         .then( function( widgets ) {
            return getWidgetDescriptors( pathToWidgets, widgets );
         } )
         .then( function( widgetInfos ) {
            var widgetPaths = [];
            var controlPaths = [];

            var widgetDescriptors = {};
            var controlDescriptors = {};

            var promises = widgetInfos.map( function( widgetInfo ) {

               var name = widgetInfo.dir.split( '/' ).pop();
               var widgetRequireDir = [ widgetsRootUrl, widgetInfo.dir, name ].join( '/' );
               widgetPaths.push( widgetRequireDir );
               widgetDescriptors[ widgetRequireDir ] = widgetInfo.descriptor;

               return findControlsForWidget( widgetInfo.descriptor )
                  .then( function( controlInfos ) {
                     controlInfos.forEach( function( controlInfo ) {
                        var controlRequireDir = controlInfo.dir;
                        if( !( controlRequireDir in controlDescriptors ) ) {
                           controlPaths.push( controlRequireDir );
                           controlDescriptors[ controlRequireDir ] = controlInfo.descriptor;
                        }
                     } );
                  } );
            } );

            return q.all( promises ).then( function() {
               deepFreeze( widgetDescriptors );
               deepFreeze( controlDescriptors );
               return {
                  widgets: widgetPaths,
                  controls: controlPaths,
                  descriptorForControl: function( controlPath ) {
                     return controlDescriptors[ controlPath ];
                  },
                  descriptorForWidget: function( widgetPath ) {
                     return widgetDescriptors[ widgetPath ];
                  }
               };
            } );
         } );
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function getWidgetDescriptors( pathToWidgets, widgets ) {
      return q.all( widgets.map( function( widgetDir ) {
         return readWidgetJson( pathToWidgets, widgetDir )
            .then( function( descriptor ) {
               return {
                  dir: widgetDir,
                  descriptor: descriptor
               };
            } );
      } ) );
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function findControlsForWidget( widgetDescriptor ) {
      return q.all( ( widgetDescriptor.controls || [] )
         .map( function( controlRef ) {
            return readControlJson( controlRef )
               .then( function( controlJson ) {
                  var requireDir = controlRef;
                  if( !controlJson.isLegacy ) {
                     var filename = controlJson.name.replace( /(.)([A-Z])/g, '$1-$2' ).toLowerCase();
                     requireDir = controlRef + '/' + filename;
                  }

                  return {
                     dir: requireDir,
                     descriptor: controlJson
                  };
               } );
         } )
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
                  pageWidgets.forEach( pushUniquely.bind( null, widgets ) );
               } );

               return widgets;
            } );
      } );
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function findPagesFromFlow( pathToFlow ) {
      return readFile( pathToFlow )
         .then( function( contents ) {
            var flow = JSON.parse( contents );
            var pages = [];

            Object.keys( flow.places )
               .filter( function( key ) { return !!flow.places[ key ].page; } )
               .map( function( key ) { return flow.places[ key ].page; } )
               .forEach( pushUniquely.bind( null, pages ) );

            return pages;
         } );
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
      var widgetJsonPath = pathToWidgets + '/' + widgetDir + '/widget.json';
      if( !( widgetJsonPath in cachedPromises ) ) {
         cachedPromises[ widgetJsonPath ] = readFile( widgetJsonPath )
            .then( function( contents ) {
               return JSON.parse( contents );
            } );
      }

      return cachedPromises[ widgetJsonPath ];
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function readControlJson( controlRef ) {
      var controlJsonPath = requirejs.toUrl( controlRef + '/control.json' );
      if( !( controlJsonPath in cachedPromises ) ) {
         cachedPromises[ controlJsonPath ] = readFile( controlJsonPath )
            .then( function( contents ) {
               return JSON.parse( contents );
            }, function() {
               // legacy code for pre-1.0.0 controls
               return {
                  integration: { technology: 'angular' },
                  isLegacy: true
               };
            } );
      }

      return cachedPromises[ controlJsonPath ];
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function pushUniquely( array, item ) {
      if( array.indexOf( item ) === -1 ) {
         array.push( item );
      }
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function deepFreeze( obj ) {
      for( var key in obj ) {
         if( obj.hasOwnProperty( key ) && type( entry ) === '[object Object]' && !Object.isFrozen( entry ) ) {
            var entry = obj[ key ];
            deepFreeze( entry );
         }
      }

      Object.freeze( obj );
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function type( obj ) {
      return Object.prototype.toString.call( obj );
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   return {

      gatherWidgetsAndControls: gatherWidgetsAndControls

   };

};

