/**
 * Copyright 2015 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
module.exports = function( grunt ) {
   'use strict';

   var TASK = 'laxar-artifacts';

   var fs = require( 'fs' );
   var q = require( 'q' );
   var glob = q.nfbind( require( 'glob' ) );
   var path = require( 'path' );
   var async = require( 'async' );
   var jsonlint = require( 'jsonlint' );

   var requirejsHelper = require( '../lib/require_config' );
   var readFile = q.nfbind( fs.readFile );
   var URL_SEP = '/';

   var helpers = require( './lib/task_helpers' )( grunt, TASK );
   var flatten = helpers.flatten;
   var lookup = helpers.lookup;
   var once = helpers.once;
   var promiseOnce = helpers.promiseOnce;

   var SELF_RESOURCES = {
      watch: [ '.' ],
      embed: [ '.' ],
      // embedding implies listing:
      list: []
   };

   grunt.registerMultiTask(
      TASK,
      'Collects artifacts for LaxarJS flows.',
      function() {
         this.requires( 'laxar-configure' );
         runArtifacts( this );
      }
   );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function runArtifacts( task ) {
      var startMs = Date.now();
      var done = task.async();
      var flowId = task.nameArgs.split( ':' )[ 1 ];
      var flowsDirectory = task.files[ 0 ].dest;

      var baseOptions = requirejsHelper.baseOptions();
      var options = task.options( baseOptions );
      if( !flowId ) {
         grunt.log.error( TASK + ': named sub-task is required!' );
         return;
      }
      var destFile = path.join( flowsDirectory, flowId, helpers.ARTIFACTS_FILE );

      grunt.verbose.writeln( TASK + ': starting with flow "' + flowId + '"' );
      var requirejsConfig = requirejsHelper.configuration( options );
      var requirejs = requirejsHelper.fromConfiguration( requirejsConfig );

      collectArtifacts( task.files )
         .then( function( artifacts ) {
            sortByPath( artifacts );
            var newResult = JSON.stringify( artifacts, null, 3 );
            helpers.writeIfChanged( destFile, newResult, startMs );
            done();
         } )
         .catch( function( err ) {
            grunt.log.error( TASK + ': ERROR:', err );
            done( err );
         } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      /** Sort artifacts by path, for output stability and developer happiness */
      function sortByPath( artifacts ) {
         Object.keys( artifacts ).forEach( function( artifactType ) {
            artifacts[ artifactType ].sort( function( a, b ) {
               return a.path < b.path ? -1 : ( a.path > b.path ? 1 : 0 );
            } );
         } );
      }

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      function getFlows( files ) {
         return flatten( files.map( function( f ) { return f.src; } ) )
            .map( function( flowPath ) {
               return {
                  path: flowPath,
                  resources: SELF_RESOURCES,
                  references: {
                     file: flowPath
                  }
               };
            } );
      }

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      /** Obtain artifact information asynchronously, starting from a set of flow definitions. */
      function collectArtifacts( files ) {
         var flows = getFlows( files );
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

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      /**
       * Asynchronously collect all pages that are reachable from the given list of flows.
       * @return {Promise<Array>} A promise to a combined array of page meta information for these flows.
       */
      function collectPages( flows ) {
         var followPageOnce = promiseOnce( followPage );
         return q.all( flows.map( followFlowToPages ) ).then( flatten );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         /** @return {Promise<Array>} A promise to an array of page-meta objects for this flow. */
         function followFlowToPages( flowInfo ) {
            return readJson( flowInfo.path ).then( function( flow ) {
               return q.all( values( flow.places ).map( followPlaceToPages ) ).then( flatten );
            } );
         }

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         /** @return {Promise<Array>} A promise to an array of page-meta objects for this place. */
         function followPlaceToPages( place ) {
            return place.page ? followPageOnce( place.page ) : q.when( [] );
         }

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         /**
          * Collect meta information about the given page, and about all pages reachable from it, recursively.
          * Skip collection if the page has already been processed (returning an empty result array).
          * @return {Promise<Array>} A promises for an array of page-meta objects.
          */
         function followPage( pageRef ) {
            var pagePath = resolvePage( pageRef );
            return readJson( pagePath ).then( function( page ) {
               var pageReferences = flatten( values( page.areas ) )
                  .filter( hasField( 'composition' ) )
                  .map( getField( 'composition' ) )
                  .concat( page.extends ? [ page.extends ] : [] );

               var widgetReferences = withoutDuplicates(
                  flatten( values( page.areas ) )
                     .filter( hasField( 'widget' ) )
                     .map( getField( 'widget' ) )
               );

               var self = {
                  path: pagePath,
                  resources: SELF_RESOURCES,
                  references: { file: pageRef },
                  pages: pageReferences,
                  widgets: widgetReferences
               };

               return q.all( pageReferences.map( followPageOnce ) ).then( function( pages ) {
                  return [ self ].concat( flatten( pages ) );
               } );
            } );
         }
      }

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      /**
       * Collect meta information on all widget that are referenced from the given pages.
       * @return {Promise<Array<Object>>} A promise for meta-information about all reachable widgets.
       */
      function collectWidgets( pages, themes ) {
         var followWidgetOnce = promiseOnce( followWidget );

         return q.all( pages.map( followPageToWidgets ) ).then( flatten );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         function followPageToWidgets( page ) {
            return q.all( page.widgets.map( followWidgetOnce ) ).then( flatten );
         }

         /////////////////////////////////////////////////////////////////////////////////////////////////////

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
               var descriptor = results[ 0 ];
               var nameFromDirectoryIsValid = results[ 1 ];

               var name = selectName( descriptor, nameFromDirectory, nameFromDirectoryIsValid );
               var type = integrationType( descriptor, 'widget' );
               var hasView = type !== 'activity';

               var cssPart = [ 'css', name + '.css' ];
               var htmlPart = [ name + '.html' ];

               var resources = descriptor.resources || {};
               var artifactHtmlRef = [ '*.theme' ].concat( htmlPart ).join( URL_SEP );
               var artifactCssRef = [ '*.theme' ].concat( cssPart ).join( URL_SEP );

               var toEmbed = resources.embed || [ 'widget.json' ].concat( hasView ? [ artifactHtmlRef ] : [] );
               var toList = resources.list || ( hasView ? [ artifactCssRef ] : [] );
               var toWatch = resources.watch || toEmbed.concat( toList ).concat( [ name + '.js' ] );

               // Take into account possible theme-folder files
               themes.filter( nonDefault ).forEach( function( theme ) {
                  // Generate an bsolute path (leading slash):
                  var basePart = [ '', theme.path, 'widgets', widgetRef ];
                  var themeCssPath = basePart.concat( cssPart ).join( path.sep );
                  toList.push( themeCssPath );
                  toWatch.push( themeCssPath );
                  var themeHtmlPath = basePart.concat( htmlPart ).join( path.sep );
                  toEmbed.push( themeHtmlPath );
                  toWatch.push( themeHtmlPath );
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
                     file: {
                        reference: path.relative( projectPath( options.widgets ), widgetPath )
                     },
                     amd: {
                        module: projectRef( [ options.widgets, widgetRef, name ].join( URL_SEP ) )
                     }
                  },
                  controls: descriptor.controls || []
               } ];
            } );

         }

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         function selectName( descriptor, nameFromDirectory, useNameFromDirectory ) {
            var nameFromDescriptor = artifactNameFromDescriptor( descriptor );
            if( useNameFromDirectory && nameFromDirectory !== nameFromDescriptor ) {
               var title = 'DEPRECATION: non-portable widget naming style.';
               var message = 'Module "' + nameFromDirectory + '" should be named "' + nameFromDescriptor +
                             '" to match the widget descriptor.';
               var details = 'For details, refer to https://github.com/LaxarJS/laxar/issues/129';
               grunt.verbose.writeln( TASK + ': ' + title + ' ' + message + '\n' + TASK + ':    ' + details );
            }

            return useNameFromDirectory ? nameFromDirectory : nameFromDescriptor;
         }

      }

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      /**
       * Collect meta information on the given co.
       * Skip collection if the widget has already been processed (returning an empty result array).
       * @return {Promise<Array<Object>>} A promise for meta-information about a single widget.
       */
      function collectControls( widgets, themes ) {
         var followControlOnce = promiseOnce( followControl );

         return q.all( widgets.map( followWidgetToControls ) ).then( function( controlsByWidget ) {
            return flatten( controlsByWidget );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         function followWidgetToControls( widget ) {
            return q.all( widget.controls.map( followControlOnce ) ).then( flatten );
         }

         /////////////////////////////////////////////////////////////////////////////////////////////////////

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
               var toList = resources.list || [ artifactCssRef ];
               var toEmbed = resources.embed || [ 'control.json' ];
               var toWatch = resources.watch || toList.concat( [ name + '.js' ] );

               // Take into account possible theme-folder files
               themes.filter( nonDefault ).forEach( function( theme ) {
                  var basePart = [ theme.path, 'controls', controlRef ];
                  var themeCssPath = basePart.concat( cssPart ).join( path.sep );
                  toList.push( themeCssPath );
                  toWatch.push( themeCssPath );
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
                        reference: controlRef,
                        module: controlModuleRef
                     }
                  }
               } ];

            } );

            //////////////////////////////////////////////////////////////////////////////////////////////////

            function fakeDescriptor() {
               return {
                  name: nameFromDirectory,
                  integration: {
                     type: 'control',
                     technology: 'angular'
                  }
               };
            }

            //////////////////////////////////////////////////////////////////////////////////////////////////

            function identity( _ ) { return _; }
         }

      }

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      function collectThemes() {
         var visited = {};
         var themes = [];

         var defaultThemePath = projectPath( options.defaultTheme );
         themes.push( themeEntry( defaultThemePath, 'default.theme' ) );

         var themesRootPath = projectPath( options.themes );
         var themesPattern = [ themesRootPath, '*.theme' ].join( path.sep );
         grunt.file.expand( themesPattern ).forEach( function( themePath ) {
            var name = themePath.split( path.sep ).pop();
            if( visited[ name ] ) {
               grunt.log.error( TASK + ': duplicate theme "' + name + '"!"' );
               return;
            }
            visited[ name ] = true;
            themes.push( themeEntry( themePath, name ) );
         } );

         return q.when( themes );

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

         var followLayoutOnce = once( followLayout );

         // First, collect all valid layout references based on the layouts that can be used.
         return q.all( [
            collectLayoutRefsFromApplication(),
            collectLayoutRefsFromTheme()
         ] ).then( function( results ) {
            return flatten( flatten( results ).map( followLayoutOnce ) );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         /** @return {Promise<Array<String>>} A promise to an array of valid layout references. */
         function collectLayoutRefsFromApplication() {
            var layoutsRootPath = projectPath( options.layouts );
            var themesGlob = '+(' + themes.map( function( theme ) { return theme.name; } ).join( '|' ) + ')';
            var layoutsGlob = [ layoutsRootPath, '**', themesGlob, '*.html' ].join( path.sep );
            return glob( layoutsGlob ).then( function( layoutHtmlPaths ) {
               return flatten( layoutHtmlPaths.map( function( layoutHtmlPath ) {
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
            var layoutsPath = projectPath( options.layouts );

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
               toList.push( applicationHtmlPath );
               toEmbed.push( applicationHtmlPath );

               if( nonDefault( theme ) ) {
                  var themeBasePart = [ '', theme.path, 'layouts' ].concat( refParts );
                  var themeCssPath = themeBasePart.concat( cssPart ).join( path.sep );
                  var themeHtmlPath = themeBasePart.concat( htmlPart ).join( path.sep );
                  toList.push( themeCssPath );
                  toList.push( themeHtmlPath );
                  toEmbed.push( themeHtmlPath );
               }
            } );

            return [ {
               resources: {
                  list: toList,
                  watch: toList,
                  embed: toEmbed
               },
               references: {
                  file: {
                     reference: layoutRef
                  }
               }
            } ];
         }
      }

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      function readJson( filePath ) {
         return readFile( filePath ).then( function( contents ) {
            return JSON.parse( contents );
         } ).catch( function( err ) {
            grunt.log.error( TASK + ': Could not read JSON file "' + filePath + '" (' + err.message + ')' );

            // Try to be helpful with syntax errors: jsonlint has nice error reporting
            if( grunt.file.exists( filePath ) ) {
               try {
                  jsonlint.parse( grunt.file.read( filePath ) );
               }
               catch( error ) {
                  grunt.log.error( error.message );
                  grunt.log.error( 'Any further problems are probably caused by the above error.\n' );
                  var fileName = path.basename( filePath );
                  if( fileName === 'widget.json' || fileName === 'control.json' ) {
                     grunt.log.error( 'If using the development server, restart it after fixing the problem!' );
                  }
               }
            }

            throw err;
         } );
      }

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      function nonDefault( theme ) {
         return theme.name !== 'default.theme';
      }

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

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

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      function values( object ) {
         return Object.keys( object ).map( lookup( object ) );
      }

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

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

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      function resolvePage( pageRef ) {
         return projectPath( path.join( options.pages, pageRef + '.json' ) );
      }

      function resolveWidget( widgetRef ) {
         return projectPath( path.join( options.widgets, widgetRef ) );
      }

      function resolveControl( controlRef ) {
         return projectPath( controlRef );
      }

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      function projectPath( requireRef ) {
         var absolutePath = requirejs.toUrl( requireRef ).split( URL_SEP ).join( path.sep );
         return path.relative( options.base, absolutePath );
      }
      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      function projectRef( requireRef ) {
         return [ options.applicationPackage ].concat( projectPath( requireRef ).split( path.sep ) ).join( URL_SEP );
      }

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

   }

};
