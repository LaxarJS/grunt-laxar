/**
 * Copyright 2015 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
exports.create = function( log, config ) {
   'use strict';

   var fs = require( 'fs' );
   var q = require( 'q' );
   var path = require( 'path' );
   var async = require( 'async' );
   var jsonlint = require( 'jsonlint' );
   var helpers = require( './helpers' );

   var glob = q.nfbind( require( 'glob' ) );
   var readFile = q.nfbind( fs.readFile );
   var readdir = q.nfbind( fs.readdir );
   var stat = q.nfbind( fs.stat );

   var requirejsHelper = require( './require_config' ).helper( config.base || '.' );

   var LOG_PREFIX = 'artifactsCollector: ';
   var URL_SEP = '/';

   var SELF_RESOURCES = {
      watch: [ '.' ],
      embed: [ '.' ],
      // embedding implies listing:
      list: []
   };

   var fileContents = config.fileContents || {};
   var handleDeprecation = config.handleDeprecation || identity;

   var api = {
      collectWidgets: collectWidgets,
      collectArtifacts: collectArtifacts,
      collectLayouts: collectLayouts,
      collectPages: collectPages,
      collectControls: collectControls
   };

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   /** Obtain artifact information asynchronously, starting from a set of flow definitions. */
   function collectArtifacts( flowPaths ) {
      var flows = collectFlows( flowPaths );
      var themesPromise = collectThemes();
      var pagesPromise = collectPages( flows );
      return q.all( [ themesPromise, pagesPromise ] )
         .then( function( results ) {
            var themes = results[ 0 ];
            var pages = results[ 1 ];
            return { flows: flows, themes: themes, pages: pages };
         } )
         .then( function( artifacts ) {
            var layoutsPromise = collectLayouts( artifacts.themes );
            var widgetsPromise = collectWidgets( artifacts.pages, artifacts.themes );
            var widgetsAndControlsPromise = widgetsPromise.then( function( widgets ) {
               var controlsPromise = collectControls( widgets, artifacts.themes );
               return controlsPromise.then( function( controls ) {
                  return { widgets: widgets, controls: controls };
               } );
            } );

            return q.all( [ layoutsPromise, widgetsAndControlsPromise ] ).then( function( results ) {
               var layouts = results[ 0 ];
               var widgetsAndControls = results[ 1 ];
               return {
                  flows: artifacts.flows,
                  themes: artifacts.themes,
                  pages: artifacts.pages,
                  layouts: layouts,
                  widgets: widgetsAndControls.widgets,
                  controls: widgetsAndControls.controls
               };
            } );
         } );
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function collectFlows( flowPaths ) {
      return flowPaths.map( function( flowPath ) {
         return {
            path: flowPath,
            resources: SELF_RESOURCES,
            references: {
               local: {
                  self: flowPath
               }
            }
         };
      } );
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   /**
    * Asynchronously collect all pages that are reachable from the given list of flows.
    * @return {Promise<Array>} A promise to a combined array of page meta information for these flows.
    */
   function collectPages( flows ) {
      var followPageOnce = helpers.promiseOnce( followPage );
      return q.all( flows.map( followFlowToPages ) ).then( helpers.flatten );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      /** @return {Promise<Array>} A promise to an array of page-meta objects for this flow. */
      function followFlowToPages( flowInfo ) {
         return readJson( flowInfo.path ).then( function( flow ) {
            return q.all( values( flow.places ).map( followPlaceToPages ) ).then( helpers.flatten );
         } );
      }

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      /** @return {Promise<Array>} A promise to an array of page-meta objects for this place. */
      function followPlaceToPages( place ) {
         return place.page ? followPageOnce( place.page ) : q.when( [] );
      }

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      /**
       * Collect meta information about the given page, and about all pages reachable from it, recursively.
       * Skip collection if the page has already been processed (returning an empty result array).
       * @return {Promise<Array>} A promises for an array of page-meta objects.
       */
      function followPage( pageRef ) {
         var pagePath = resolvePage( pageRef );
         return readJson( pagePath ).then( function( page ) {
            var pageReferences = helpers.flatten( values( page.areas ) )
               .filter( hasField( 'composition' ) )
               .map( getField( 'composition' ) )
               .concat( page.extends ? [ page.extends ] : [] );

            var widgetReferences = withoutDuplicates(
               helpers.flatten( values( page.areas ) )
                  .filter( hasField( 'widget' ) )
                  .map( getField( 'widget' ) )
            );

            var self = {
               path: pagePath,
               resources: SELF_RESOURCES,
               references: {
                  local: {
                     self: pageRef
                  }
               },
               pages: pageReferences,
               widgets: widgetReferences
            };

            return q.all( pageReferences.map( followPageOnce ) ).then( function( pages ) {
               return [ self ].concat( helpers.flatten( pages ) );
            } );
         } );
      }
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   /**
    * Collect meta information on all widget that are referenced from the given pages.
    * @return {Promise<Array<Object>>} A promise for meta-information about all reachable widgets.
    */
   function collectWidgets( pages, themes ) {
      var followWidgetOnce = helpers.promiseOnce( followWidget );

      return q.all( pages.map( followPageToWidgets ) ).then( helpers.flatten );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      function followPageToWidgets( page ) {
         return q.all( page.widgets.map( followWidgetOnce ) ).then( helpers.flatten );
      }

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      /**
       * Collect meta information on the given widget.
       * Skip collection if the widget has already been processed (returning an empty result array).
       *
       * @param {string} widgetRef
       *    A reference to a widget.
       *    Currently this has to be a relative URL, interpreted based on laxar-path-widgets.
       * @return {Promise<Array<Object>>}
       *    A promise for meta-information about a single widget.
       */
      function followWidget( widgetRef ) {

         var widgetPath = resolveWidget( widgetRef );
         var descriptorPath = path.join( widgetPath, 'widget.json' );
         // Support two widget module naming styles:
         //  - old-school: the directory name determines the module name
         //  - new-school: the descriptor artifact name determines the module name
         // Only the new-school way supports installing widgets using bower and finding them using AMD.
         var parts = widgetRef.split( URL_SEP );
         var nameFromDirectory = parts[ parts.length - 1 ];

         return q.all( [
            readJson( descriptorPath ),
            helpers.fileExists( path.join( widgetPath, nameFromDirectory + '.js' ) )
         ] ).then( function( results ) {
            var referenceInfo = extractScheme( widgetRef );
            var isAmdReference = referenceInfo.scheme === 'amd';
            var descriptor = results[ 0 ];
            var nameFromDirectoryIsValid = results[ 1 ];

            var moduleName = selectName( descriptor, nameFromDirectory, nameFromDirectoryIsValid );
            var type = integrationType( descriptor, 'widget' );
            var hasView = type !== 'activity';

            var cssPart = [ 'css', moduleName + '.css' ];
            var htmlPart = [ moduleName + '.html' ];

            var resources = descriptor.resources || {};
            var artifactHtmlRef = [ '*.theme' ]
               .concat( htmlPart )
               .join( URL_SEP );
            var artifactCssRef = [ '*.theme' ]
               .concat( cssPart )
               .join( URL_SEP );

            var toEmbed = [ 'widget.json' ]
               .concat( hasView ? [ artifactHtmlRef ] : [] )
               .concat( resources.embed || [] );
            var toList = ( hasView ? [ artifactCssRef ] : [] )
               .concat( resources.list || [] );
            var toWatch = toEmbed
               .concat( toList )
               .concat( [ moduleName + '.js' ] )
               .concat( resources.watch || [] );

            // Take into account possible theme-folder files
            themes.filter( nonDefault ).forEach( function( theme ) {
               // A path for a local widget is constructed of a category directory and the widget directory.
               // This is reflected in the location of its theme assets. Hence the distinction here.
               var themeDirectory = isAmdReference ? moduleName : widgetRef;
               // Generate an absolute path (leading slash):
               var basePart = [ '', theme.path, 'widgets', themeDirectory ];
               var themeCssPath = basePart.concat( cssPart ).join( path.sep );
               toList.unshift( themeCssPath );
               toWatch.unshift( themeCssPath );
               var themeHtmlPath = basePart.concat( htmlPart ).join( path.sep );
               toEmbed.unshift( themeHtmlPath );
               toWatch.unshift( themeHtmlPath );
            } );

            return [ {
               path: widgetPath,
               integration: {
                  technology: integrationTechnology( descriptor, 'angular' ),
                  type: type
               },
               resources: {
                  watch: toWatch,
                  embed: toEmbed,
                  list: toList
               },
               references: {
                  local: {
                     self: path.relative( requirejsHelper.projectPath( 'laxar-path-widgets' ), widgetPath )
                  },
                  amd: {
                     self: path.relative( requirejsHelper.projectPath( '.' ), widgetPath ),
                     module: isAmdReference ? [ referenceInfo.ref, moduleName ].join( URL_SEP ) :
                        requirejsHelper.projectRef( [ 'laxar-path-widgets', widgetRef, moduleName ].join( URL_SEP ) )
                  }
               },
               controls: descriptor.controls || []
            } ];
         } );

      }

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      function selectName( descriptor, nameFromDirectory, useNameFromDirectory ) {
         var nameFromDescriptor = artifactNameFromDescriptor( descriptor );
         if( useNameFromDirectory && nameFromDirectory !== nameFromDescriptor ) {
            var title = 'DEPRECATION: non-portable widget naming style.';
            var message = 'Module "' + nameFromDirectory + '" should be named "' + nameFromDescriptor +
               '" to match the widget descriptor.';
            var details = 'For details, refer to https://github.com/LaxarJS/laxar/issues/129';
            handleDeprecation( LOG_PREFIX + title + ' ' + message + '\n' + LOG_PREFIX + details );
         }

         return useNameFromDirectory ? nameFromDirectory : nameFromDescriptor;
      }

   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   /**
    * Collect meta information on the given co.
    * Skip collection if the widget has already been processed (returning an empty result array).
    * @return {Promise<Array<Object>>} A promise for meta-information about a single widget.
    */
   function collectControls( widgets, themes ) {
      var followControlOnce = helpers.promiseOnce( followControl );

      return q.all( widgets.map( followWidgetToControls ) ).then( function( controlsByWidget ) {
         return helpers.flatten( controlsByWidget );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      function followWidgetToControls( widget ) {
         return q.all( widget.controls.map( followControlOnce ) ).then( helpers.flatten );
      }

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      /**
       * Collect meta information on the given control.
       * Skip collection if the control has already been processed (returning an empty result array).
       * @return {Promise<Array<Object>>} A promise for meta-information about a single widget.
       */
      function followControl( controlRef ) {

         var controlPath = resolveControl( controlRef );
         var descriptorPath = path.join( controlPath, 'control.json' );

         // Support controls without a control.json descriptor:
         //  - old-school: the directory name determines the module name
         //  - new-school: the descriptor artifact name determines the module name
         // Only the new-school way supports installing controls using bower and finding them using AMD.
         var parts = controlRef.split( URL_SEP );
         var nameFromDirectory = parts[ parts.length - 1 ];

         return readJson( descriptorPath ).then( identity, fakeDescriptor ).then( function( descriptor ) {

            var name = artifactNameFromDescriptor( descriptor );
            var controlModuleRef = [ controlRef, name ].join( URL_SEP );

            var resources = descriptor.resources || {};
            var cssPart = [ 'css', name + '.css' ];

            var artifactCssRef = [ '*.theme' ].concat( cssPart ).join( URL_SEP );
            var toList = [ artifactCssRef ].concat( resources.list || [] );
            var toEmbed = [ 'control.json' ].concat( resources.embed || [] );
            var toWatch = toList.concat( [ name + '.js' ] ).concat( resources.watch || [] );

            // Take into account possible theme-folder files
            themes.filter( nonDefault ).forEach( function( theme ) {
               var basePart = [ '', theme.path, 'controls', controlRef ];
               var themeCssPath = basePart.concat( cssPart ).join( path.sep );
               toList.unshift( themeCssPath );
               toWatch.unshift( themeCssPath );
            } );

            return [ {
               path: controlPath,
               integration: {
                  technology: integrationTechnology( descriptor, 'angular' ),
                  type: integrationType( descriptor, 'control' )
               },
               resources: {
                  watch: toWatch,
                  embed: toEmbed,
                  list: toList
               },
               references: {
                  amd: {
                     self: controlRef,
                     module: controlModuleRef
                  }
               }
            } ];

         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         function fakeDescriptor() {
            return {
               name: nameFromDirectory,
               integration: {
                  type: 'control',
                  technology: 'angular'
               }
            };
         }
      }
   }

   ////////////////////////////////////////////////////////////////////////////////////////////////////////

   function collectThemes() {
      var defaultThemePath = requirejsHelper.projectPath( 'laxar-path-default-theme' );
      var themesRootPath = requirejsHelper.projectPath( 'laxar-path-themes' );

      return readdir( themesRootPath )
         .then( function( dirs ) {
            return q.all( dirs
               .map( function( dir ) {
                  var absDir = path.join( themesRootPath, dir );
                  return stat( absDir )
                     .then( function( stats ) {
                        return stats.isDirectory() && dir.match( /\.theme$/ ) ? absDir : null;
                     } );
               } ) );
         } )
         .then( function( dirs ) {
            return dirs
               .filter( function( dir ) {
                  return !!dir;
               } )
               .map( function( dir ) {
                  var name = dir.split( path.sep ).pop();
                  return themeEntry( dir, name );
               } )
               .concat( [ themeEntry( defaultThemePath, 'default.theme' ) ] );
         } );

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      function themeEntry( themePath, name ) {
         var cssPath = path.join( 'css', 'theme.css' );

         return {
            path: themePath,
            name: name,
            resources: {
               watch: [ cssPath ],
               list: [ cssPath ],
               embed: []
            },
            references: {
               local: {
                  self: name
               }
            }
         };
      }
   }

   ////////////////////////////////////////////////////////////////////////////////////////////////////////

   /**
    * Finds layouts based on the contents of the project file system.
    * In the future we want to change this to only include layouts that are actually reachable from a flow.
    * For this, we'll need to pull the ax-layout-directive out of user-space.
    *
    * @param themes
    * @returns {Array}
    */
   function collectLayouts( themes ) {

      var followLayoutOnce = helpers.once( followLayout );

      // First, collect all valid layout references based on the layouts that can be used.
      return q.all( [
         collectLayoutRefsFromApplication(),
         collectLayoutRefsFromTheme()
      ] ).then( function( results ) {
         return helpers.flatten( helpers.flatten( results ).map( followLayoutOnce ) );
      } );

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      /** @return {Promise<Array<String>>} A promise to an array of valid layout references. */
      function collectLayoutRefsFromApplication() {
         var layoutsRootPath = requirejsHelper.projectPath( 'laxar-path-layouts' );
         var themesGlob = '+(' + themes.map( function( theme ) { return theme.name; } ).join( '|' ) + ')';
         var layoutsGlob = [ layoutsRootPath, '**', themesGlob, '*.html' ].join( path.sep );
         return glob( layoutsGlob ).then( function( layoutHtmlPaths ) {
            return helpers.flatten( layoutHtmlPaths.map( function( layoutHtmlPath ) {
               var parts = layoutHtmlPath.split( path.sep );
               // to get the ref, strip theme folder and HTML file
               var layoutFolderPath = parts.slice( 0, parts.length - 2 ).join( path.sep );
               return path.relative( layoutsRootPath, layoutFolderPath );
            } ) );
         } );
      }

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      /** @return {Promise<Array<String>>} A promise to an array of valid layout references. */
      function collectLayoutRefsFromTheme() {
         return q.when( [] );
      }

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      /** @return {Array} Collect all resources possibly associated with this layout. */
      function followLayout( layoutRef ) {
         var layoutsPath = requirejsHelper.projectPath( 'laxar-path-layouts' );

         var refParts = layoutRef.split( URL_SEP );
         var layoutName = refParts[ refParts.length - 1 ];
         var cssPart = [ 'css', layoutName + '.css' ];
         var htmlPart = [ layoutName + '.html' ];

         var toEmbed = [];
         var toList = [];
         themes.forEach( function( theme ) {
            // Prepend path.sep to all paths to generate 'absolute' paths (relative to the project).
            var applicationBasePart = [ '', layoutsPath ].concat( refParts ).concat( [ theme.name ] );
            var applicationCssPath = applicationBasePart.concat( cssPart ).join( path.sep );
            var applicationHtmlPath = applicationBasePart.concat( htmlPart ).join( path.sep );
            toList.push( applicationCssPath );
            toEmbed.push( applicationHtmlPath );

            if( nonDefault( theme ) ) {
               var themeBasePart = [ '', theme.path, 'layouts' ].concat( refParts );
               var themeCssPath = themeBasePart.concat( cssPart ).join( path.sep );
               var themeHtmlPath = themeBasePart.concat( htmlPart ).join( path.sep );
               toList.unshift( themeCssPath );
               toEmbed.unshift( themeHtmlPath );
            }
         } );

         return [ {
            resources: {
               list: toList,
               watch: toList,
               embed: toEmbed
            },
            references: {
               local: {
                  self: layoutRef
               }
            }
         } ];
      }
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function readJson( filePath ) {
      if( fileContents[ filePath ] ) {
         return q.when( fileContents[ filePath ] );
      }

      return readFile( filePath )
         .then( function( contents ) {
            return JSON.parse( contents );
         } )
         .catch( function( err ) {
            log.error( 'Could not read JSON file "' + filePath + '" (' + err.message + ')' );

            // Try to be helpful with syntax errors: jsonlint has nice error reporting
            if( fs.existsSync( filePath ) ) {
               try {
                  jsonlint.parse( fs.readFileSync( filePath ) );
               }
               catch( error ) {
                  log.error( error.message );
                  log.error( 'Any further problems are probably caused by the above error.\n' );
                  var fileName = path.basename( filePath );
                  if( fileName === 'widget.json' || fileName === 'control.json' ) {
                     log.error( 'If using the development server, restart it after fixing the problem!' );
                  }
               }
            }

            throw err;
         } );
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function nonDefault( theme ) {
      return theme.name !== 'default.theme';
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function withoutDuplicates( items, field ) {
      var seen = {};
      return items.filter( function( value ) {
         var key = field ? value[ field ] : value;
         if( seen[ key ] ) {
            return false;
         }
         seen[ key ] = true;
         return true;
      } );
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function values( object ) {
      return Object.keys( object ).map( helpers.lookup( object ) );
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function hasField( field ) {
      return function( value ) {
         return value.hasOwnProperty( field );
      };
   }

   function getField( field ) {
      return function( value ) {
         return value[ field ];
      };
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function resolvePage( pageRef ) {
      return requirejsHelper.projectPath( path.join( 'laxar-path-pages', pageRef + '.json' ) );
   }

   function resolveWidget( widgetRef ) {
      return requirejsHelper.projectPath( resolveAssetPath( widgetRef, 'laxar-path-widgets', 'local' ) );
   }

   function resolveControl( controlRef ) {
      return requirejsHelper.projectPath( resolveAssetPath( controlRef, 'laxar-path-controls' ) );
   }

   function resolveAssetPath( refWithScheme, defaultAssetDirectory, optionalDefaultScheme ) {
      var info = extractScheme( refWithScheme, optionalDefaultScheme || 'amd' );
      if( typeof schemeLoaders[ info.scheme ] !== 'function' ) {
         throw new Error( 'Unknown schema type "' + info.scheme + '" in reference "' + refWithScheme + '".' );
      }
      return path.normalize( schemeLoaders[ info.scheme ]( info.ref, defaultAssetDirectory ) );
   }

   var schemeLoaders = {
      local: function( ref, defaultAssetDirectory ) {
         return path.join( defaultAssetDirectory, ref );
      },
      amd: function( ref ) {
         return ref;
      }
   };

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function extractScheme( ref, defaultScheme ) {
      var parts = ref.split( ':' );
      return {
         scheme: parts.length === 2 ? parts[ 0 ] : defaultScheme,
         ref: parts.length === 2 ? parts[ 1 ]: parts[ 0 ]
      };
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function artifactNameFromDescriptor( descriptor ) {
      return descriptor.name.replace( /([a-z0-9])([A-Z])/g, '$1-$2' ).toLowerCase();
   }

   function integrationTechnology( descriptor, fallback ) {
      var integration = descriptor.integration;
      return ( integration && integration.technology ) || fallback;
   }

   function integrationType( descriptor, fallback ) {
      var integration = descriptor.integration;
      return ( integration && integration.type ) || fallback;
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function identity( _ ) { return _; }

   return api;

};
