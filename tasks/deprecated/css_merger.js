/**
 * Copyright 2014 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
module.exports = function( grunt ) {
   'use strict';

   var systemPath = require( 'path' );
   var path = require( '../../lib/path-platform/path' ).posix;

   grunt.task.registerMultiTask(
      'css_merger',
      'DEPRECATED: Merges multiple css files into one file', function() {

      var options = this.options( {
         base: '.',
         pages: 'laxar-path-pages',
         themes: 'laxar-path-themes',
         layouts: 'laxar-path-layouts',
         widgets: 'laxar-path-widgets',
         output: 'var/static/css',
         defaultTheme: 'default.theme',
         requireConfig: 'require_config.js'
      } );

      var q = require( 'q' );
      var config = require( '../../lib/require_config' )( options.requireConfig, options );

      var laxarPath = systemPath
         .relative( options.base, require.resolve( 'laxar' ) )
         .split( systemPath.sep )
         .join( path.sep );

      config.paths.laxar = path.relative(
         path.resolve( config.baseUrl ),
         path.resolve( path.dirname( laxarPath ) )
      );

      var requirejs = require( 'requirejs' ).config( config );
      var paths = require( '../../lib/laxar_paths' )( config, options );

      var pathToDefaultTheme = path.relative( options.base, paths.DEFAULT_THEME );
      var pathToPages = path.relative( options.base, paths.PAGES );
      var pathToThemes = path.relative( options.base, paths.THEMES );
      var pathToLayouts = path.relative( options.base, paths.LAYOUTS );
      var pathToWidgets = path.relative( options.base, paths.WIDGETS );

      grunt.file.mkdir( options.output );

      var flowFiles = this.files;
      var done = this.async();
      q.all( collectThemes()
         .map( function( theme ) {
            var mainCss = fixUrls( grunt.file.read( theme.mainFile ), theme.mainFile, options.output );
            var layoutCss = readLayouts( theme, pathToLayouts );

            return readWidgetsFromFlow( flowFiles, theme, pathToWidgets )
               .then( function( widgetCss ) {
                  var outputFilePath = path.join( options.output, theme.name + '.css' );
                  var css = [ mainCss ].concat( layoutCss ).concat( widgetCss ).concat( '' ).join( '\n' );
                  grunt.file.write( outputFilePath, withImportsOnTop( css ) );
                  grunt.log.ok( 'Created merged css file in "' + outputFilePath + '".' );
                  return q.when();
               } );
         } )
      ).then( done ).catch( done );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      function withImportsOnTop( css ) {
         var imports = [];
         // match plain imports and imports containing quoted strings using single or double quotes:
         var matcher = /@import([^;"']*|[^;]*['][^']*['][^;]*|[^;]*["][^']*["][^;]*);/g;
         var cssWithoutImports = css.replace( matcher, function( $0 ) {
            imports.push( $0 );
            return '';
         } );
         return imports.join( '\n' ) + '\n' + cssWithoutImports;
      }

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      function collectThemes() {
         var themes = [];
         processThemeDir( pathToDefaultTheme, options.defaultTheme );
         grunt.file.expand( pathToThemes + '/*.theme' ).forEach( function( dir ) {
            processThemeDir( dir );
         } );
         return themes;

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         function processThemeDir( dir, themeName ) {
            var cssMainFile = path.join( dir, 'css/theme.css' );
            var themeDir = path.relative( options.base, dir );
            if( grunt.file.exists( cssMainFile ) ) {
               themes.push( {
                  name: themeName || themeDir.replace( pathToThemes + path.sep, '' ),
                  path: themeDir,
                  mainFile: cssMainFile
               } );
            }
         }

      }

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      function readLayouts( theme, applicationLayoutsRoot ) {
         // collect all possible layout references:
         var themeLayoutsRoot = path.join( theme.path, 'layouts' );
         var cssFilesByLayout = collectCssFiles( applicationLayoutsRoot, themeLayoutsRoot );

         return Object.keys( cssFilesByLayout ).reduce( function( css, layout ) {
            var alternatives = cssFilesByLayout[ layout ];
            return alternatives.length ? css.concat( [ readCss( alternatives[ 0 ] ) ] ) : css;
         }, [] );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         function collectCssFiles( appLayoutsRoot, themeLayoutsRoot ) {
            var result = collectLayouts();
            Object.keys( result ).forEach( function( layout ) {
               var baseName = layout.split( path.sep ).pop() + '.css';

               // theme folder within application layout folder:
               var places = [ [ appLayoutsRoot, layout, theme.name, 'css', baseName ].join( '/' ) ];
               if( theme.name !== options.defaultTheme ) {
                  // layout folder within theme folder:
                  places.push( [ themeLayoutsRoot, layout, 'css', baseName ].join( '/' ) );
                  // fallback to default theme folder within application layout folder:
                  places.push( [ appLayoutsRoot, layout, options.defaultTheme, 'css', baseName ].join( '/' ) );
               }

               result[ layout ] = places.reduce( function( res, cssLocation ) {
                  return res.concat( grunt.file.expand( cssLocation ) );
               }, [] );
            } );
            return result;

            //////////////////////////////////////////////////////////////////////////////////////////////////

            function collectLayouts() {
               var layoutsMap = {};
               [ appLayoutsRoot, themeLayoutsRoot ].forEach( function( root ) {
                  grunt.file.expand( root + '/**/*.html' ).forEach( function( htmlFilePath ) {
                     var resolvedHtmlFilePath = path.relative( options.base, htmlFilePath );
                     var layoutRef = path.relative( root, resolvedHtmlFilePath )
                        .split( path.sep ).slice( 0, -2 ).join( path.sep );
                     if( layoutRef ) {
                        layoutsMap[ layoutRef ] = [];
                     }
                  } );
               } );
               return layoutsMap;
            }
         }
      }

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      function readWidgetsFromFlow( flowFiles, theme ) {

         var widgetCollector = setupWidgetCollector();

         return q.all( flowFiles.map( function( file ) {
            return q.all( file.src.map( cssFilesForFlow ) ).then( flatten );
         } ) ).then( flatten );

         function cssFilesForFlow( flow ) {
            return widgetCollector.gatherWidgetsAndControls( paths.WIDGETS, flow )
               .then( function( result ) {
                  var controlCss = result.controls.map( function( requireControlPath ) {
                     var descriptor = result.descriptorForControl( requireControlPath );
                     var fileName = fileNameForControl( requireControlPath, theme, descriptor );
                     return readCss( fileName );
                  } );

                  var widgetCss = result.widgets.map( function( widget ) {
                     var projectWidgetPath = path.join( config.baseUrl, widget );
                     var relativeWidgetPath = path.relative( pathToWidgets, projectWidgetPath );
                     var fileName = fileNameForWidget( path.dirname( relativeWidgetPath ), theme );
                     return readCss( fileName );
                  } );

                  return controlCss.concat( widgetCss );
               } );
         }

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         function setupWidgetCollector() {
            grunt.verbose.writeln( 'Css Merger: loading page loader' );
            var PageLoader = requirejs( 'laxar/lib/loaders/page_loader' );
            var WidgetCollector = require( '../../lib/widget_collector' );

            grunt.verbose.writeln( 'Css Merger: page loader' );
            var pageLoader = PageLoader.create( q, httpClient(), pathToPages );

            var widgetsRoot = path.relative( config.baseUrl, paths.WIDGETS );
            grunt.verbose.writeln( 'Css Merger: initializing widget collector' );
            return WidgetCollector.create( requirejs, widgetsRoot, pageLoader );
         }

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         function httpClient() {
            return {
               get: function( url ) {
                  var deferred = q.defer();
                  process.nextTick( function() {
                     grunt.verbose.writeln( 'Css Merger: reading "' + url + '"' );
                     deferred.resolve( { data: grunt.file.readJSON( url ) } );
                  } );
                  return deferred.promise;
               }
            };
         }
      }

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      function fileNameForWidget( relativeWidgetPath, theme ) {
         var fragments = relativeWidgetPath.split( path.sep );
         var widgetName = fragments[ fragments.length - 1 ];
         return getCandidate( [
            path.join( pathToWidgets, relativeWidgetPath, theme.name, 'css', widgetName + '.css' ),
            path.join( theme.path, 'widgets', relativeWidgetPath, 'css', widgetName + '.css' ),
            path.join( pathToWidgets, relativeWidgetPath, options.defaultTheme, 'css', widgetName + '.css' )
         ] );
      }

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      function fileNameForControl( requireModulePath, theme, descriptor ) {
         // support legacy controls (LaxarJS 0.x) that do not have a control.json
         var absoluteControlPath = requirejs.toUrl( requireModulePath );
         var fragments = absoluteControlPath.split( '/' );
         var controlName = fragments[ fragments.length - 1 ];
         var themeControlPath = path.join( theme.path, requireModulePath, 'css', controlName + '.css' );

         if( !descriptor.isLegacy ) {
            // LaxarJS 1.x style control: use name from control.json descriptor
            controlName = descriptor.name.replace( /(.)([A-Z])/g, '$1-$2' ).toLowerCase();
            fragments.pop();
            themeControlPath = path.join( theme.path, 'controls', controlName, 'css', controlName + '.css' );
         }

         return getCandidate( [
            path.join( fragments.join( '/' ), theme.name, 'css', controlName + '.css' ),
            themeControlPath,
            path.join( fragments.join( '/' ), options.defaultTheme, 'css', controlName + '.css' )
         ] );
      }

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      function readCss( fileName ) {
         if( fileName ) {
            return fixUrls( grunt.file.read( fileName ), fileName, options.output ).trim();
         }
         return '';
      }

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      function getCandidate( candidates ) {
         for( var i = 0; i < candidates.length; ++i ) {
            if( grunt.file.exists( candidates[ i ] ) ) {
               return candidates[ i ];
            }
         }
         return null;
      }

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      function fixUrls( css, sourceFileName, destinationDirectory ) {
         var sourceDirectory = path.relative( options.base, path.dirname( sourceFileName ) );
         var destinationFragments = destinationDirectory.replace( /\/$/, '' ).split( '/' );
         var pathPrefix = new Array( destinationFragments.length + 1 ).join( '../' );
         var urlMatcher = /url\(\s*([^\)]*)\s*\)/g;
         var schemeMatcher = /^['"]?([a-zA-Z]+[:])?\/\/.*/;
         return css.replace( urlMatcher, function( fullMatch, url ) {
            if( schemeMatcher.test( url ) ) {
               return fullMatch;
            }

            var fixedUrl = path.join(
               pathPrefix,
               sourceDirectory,
               url.replace( /["']/g, '' )
            ).split( path.sep ).join( '/' );
            return 'url("' + fixedUrl + '")';
         } );
      }

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      function flatten( lists ) {
         return [].concat.apply( [], lists );
      }

   } );
};
