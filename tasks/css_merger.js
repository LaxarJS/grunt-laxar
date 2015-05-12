/**
 * Copyright 2014 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
module.exports = function( grunt ) {
   'use strict';

   var path = require( 'path' );

   grunt.task.registerMultiTask( 'css_merger', 'Merges multiple css files into one file', function() {

      var options = this.options( {
         base: '.',
         themes: 'laxar-path-themes',
         layouts: 'laxar-path-layouts',
         widgets: 'laxar-path-widgets',
         output: 'var/static/css',
         defaultTheme: 'default.theme',
         requireConfig: 'require_config.js'
      } );

      var q = require( 'q' );
      var config = require( '../lib/require_config' )( options.requireConfig, options );
      var requirejs = require( 'requirejs' ).config( config );
      var paths = require( '../lib/laxar_paths' )( config, options );

      var base = options.base;
      var pathToDefaultTheme = path.resolve( paths.DEFAULT_THEME );
      var pathToThemes = path.resolve( paths.THEMES );
      var pathToLayouts = path.resolve( paths.LAYOUTS );
      var pathToWidgets = path.resolve( paths.WIDGETS );

      grunt.file.mkdir( options.output );

      var flowFiles = this.files;
      var done = this.async();
      q.all( collectThemes().map( function( theme ) {
         var mainCss = fixUrls( grunt.file.read( theme.mainFile ), theme.mainFile, options.output );
         var layoutCss = readLayouts( theme, pathToLayouts );
         return readWidgetsFromFlow( flowFiles, theme, pathToWidgets ).then( function( widgetCss ) {
            var outputFilePath = options.output + '/' + theme.name + '.css';
            var css = [ mainCss ].concat( layoutCss ).concat( widgetCss ).concat( '\n' ).join( '' );
            grunt.file.write( outputFilePath, withImportsOnTop( css ) );
            grunt.log.ok( 'Created merged css file in "' + outputFilePath + '".' );
            return q.when();
         } );
      } ) ).then( done ).catch( done );

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
            var cssMainFile = dir + '/css/theme.css';
            var themeDir = path.resolve( dir );
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
               var baseName = layout.split( /[/\\]/ ).pop() + '.css';
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
                     var layout = htmlFilePath.replace( root, '' ).replace( /^[/]/, '' ).replace(
                        /[/]([^\/]*\.theme[/])?[^\/]*\.html$/,
                        ''
                     );
                     if( layout ) {
                        layoutsMap[ layout ] = [];
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

         var widgets = [];
         var controls = [];
         var uniqueWidget = once();
         var uniqueControl = once();

         var collectAll = q.all( flowFiles.map( function( file ) {
            return q.all( file.src.map( function( flow ) {
               return widgetCollector.gatherWidgetsAndControls( paths.WIDGETS, flow ).then( function( result ) {
                  Object.keys( result.widgets ).forEach( function( technology ) {
                     widgets = widgets.concat( result.widgets[ technology ].filter( uniqueWidget ) );
                  } );
                  controls = controls.concat( result.controls.filter( uniqueControl ) );
                  return q.when();
               } );
            } ) );
         } ) );

         return collectAll.then( function() {
            var controlCss = controls.map( function( requireControlPath ) {
               var fileName = fileNameForControl( requireControlPath, theme );
               return readCss( fileName );
            } );

            var widgetCss = widgets.map( function( widget ) {
               var widgetPath = path.resolve( path.join( config.baseUrl, widget ) );
               var widgetModulePath = widgetPath.substring( path.join( pathToWidgets, '/' ).length );
               var relativeWidgetPath = widgetModulePath.substring( 0, widgetModulePath.lastIndexOf( '/' ) );
               var fileName = fileNameForWidget( relativeWidgetPath, theme );
               return readCss( fileName );
            } );

            return q.when( controlCss.concat( widgetCss ) );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         function setupWidgetCollector() {
            grunt.verbose.writeln( 'Css Merger: loading page loader' );
            var PageLoader = requirejs( 'laxar/lib/loaders/page_loader' );
            var WidgetCollector = require( '../lib/widget_collector' );
            var client = httpClient();

            grunt.verbose.writeln( 'Css Merger: page loader' );
            var pageLoader = PageLoader.create( q, client, paths.PAGES );

            grunt.verbose.writeln( 'Css Merger: initializing widget collector' );
            var widgetsRoot = path.relative( config.baseUrl, paths.WIDGETS );
            return WidgetCollector.create( requirejs, client, widgetsRoot, pageLoader );
         }

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         function once() {
            var seenKeys = {};
            return function( key ) {
               var isNew = !seenKeys[ key ];
               seenKeys[ key ] = true;
               return isNew;
            };
         }

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         function httpClient() {
            return {
               get: function( url ) {
                  var deferred = q.defer();
                  process.nextTick( function() {
                     grunt.verbose.writeln( 'Css Merger: reading "' + url + '"' );
                     if( grunt.file.exists( url ) ) {
                        deferred.resolve( { data: grunt.file.readJSON( url ) } );
                        return;
                     }
                     deferred.reject( new Error( 'Could not load ' + url ) );
                  } );
                  return deferred.promise;
               }
            };
         }
      }

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      function fileNameForWidget( relativeWidgetPath, theme ) {
         var fragments = relativeWidgetPath.split( '/' );
         var widgetName = fragments[ fragments.length - 1 ];
         return getCandidate( [
            path.join( pathToWidgets, relativeWidgetPath, theme.name, 'css', widgetName + '.css' ),
            path.join( theme.path, 'widgets', relativeWidgetPath, 'css', widgetName + '.css' ),
            path.join( pathToWidgets, relativeWidgetPath, options.defaultTheme, 'css', widgetName + '.css' )
         ] );
      }

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      function fileNameForControl( requireControlPath, theme ) {
         var absoluteControlPath = requirejs.toUrl( requireControlPath );
         var fragments = absoluteControlPath.split( '/' );
         var controlName = fragments[ fragments.length - 1 ];
         return getCandidate( [
            path.join( theme.path, requireControlPath, 'css', controlName + '.css' ),
            path.join( absoluteControlPath, options.defaultTheme, 'css', controlName + '.css' )
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
            if( grunt.file.exists( candidates[i] ) ) {
               return candidates[i];
            }
         }
         return null;
      }

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      function fixUrls( css, sourceFileName, destinationDirectory ) {
         var sourceDirectory = path.relative( base, sourceFileName.replace( /\/[^\/]*\.css$/, '' ) );
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

   } );
};
