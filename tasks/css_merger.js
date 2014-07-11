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
            grunt.file.write( outputFilePath, [ mainCss ].concat( layoutCss ).concat( widgetCss ).join( '' ) );
            grunt.log.ok( 'Created merged css file in "' + outputFilePath + '".' );
            return q.when();
         } );
      } ) ).then( done );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      function collectThemes() {
         var themes = [];
         processThemeDir( pathToDefaultTheme, options.defaultTheme );
         grunt.file.expand( pathToThemes + '/*.theme' ).forEach( processThemeDir );
         return themes;

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         function processThemeDir( dir, themeName ) {
            var cssMainFile = dir + '/css/theme.css';
            if( grunt.file.exists( cssMainFile ) ) {
               themes.push( {
                  name: themeName || dir.replace( pathToThemes + '/', '' ),
                  path: dir,
                  mainFile: cssMainFile
               } );
            }
         }
      }

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      function readLayouts( theme, path ) {
         var layoutsRead = [];

         // Layouts are identified by collecting HTML files.
         // The layout folders may directly contain the corresponding CSS files or there may be theme folders.
         return grunt.file.expand( path + '/**/*.html' ).reduce( function( css, assetDir ) {
            var relativePath = assetDir.replace( path + '/', '' );
            var parts = relativePath.split( '/' );

            var layoutName;
            var layoutPath;
            if( parts[ parts.length - 2 ].match( /\.theme$/ ) ) {
               // We have a layout with standard theme folder
               layoutName = parts.slice( 0, parts.length - 2 ).join( '/' );
               layoutPath = path + '/' + layoutName + '/';
            }
            else {
               // Assume we have a layout without proper theming
               layoutName = parts.slice( 0, parts.length - 1 ).join( '/' );
               layoutPath = path + '/' + layoutName + '/';
            }

            if( layoutsRead.indexOf( layoutName ) === -1 ) {
               layoutsRead.push( layoutName );
               var fileName = fileNameForLayout( layoutPath, theme );
               return css.concat( [ readCss( fileName ) ] );
            }

            return css;
         }, [] );
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
                  widgets = widgets.concat( result.widgets.filter( uniqueWidget ) );
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
            var PageLoader = requirejs( 'laxar/lib/portal/portal_assembler/page_loader' );
            var WidgetCollector = require( '../lib/widget_collector' );
            var client = httpClient();

            grunt.verbose.writeln( 'Css Merger: page loader' );
            var pageLoader = PageLoader.create( q, client, paths.PAGES );

            grunt.verbose.writeln( 'Css Merger: initializing widget collector' );
            return WidgetCollector.create( client, path.relative( config.baseUrl, paths.WIDGETS ), pageLoader );
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
                     deferred.resolve( { data: grunt.file.readJSON( url ) } );
                  } );
                  return deferred.promise;
               }
            };
         }
      }

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      function fileNameForLayout( layoutPath, theme ) {
         var fragments = layoutPath.split( '/' );
         var layoutName = fragments[ fragments.length - 2 ];
         return getCandidate( [
            path.join( layoutPath, theme.name, 'css', layoutName + '.css' ),
            path.join( layoutPath, options.defaultTheme, 'css', layoutName + '.css' ),
            path.join( layoutPath, 'css', layoutName + '.css' ) // deprecated old directory layout
         ] );
      }

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      function fileNameForWidget( relativeWidgetPath, theme ) {
         var fragments = relativeWidgetPath.split( '/' );
         var widgetName = fragments[ fragments.length - 1 ];
         return getCandidate( [
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

         var urlMatcher = /url\(([^\)]*)\)/g;
         var schemeMatcher = /^['"]?[a-zA-Z]+[:]\/\/.*/;
         return css.replace( urlMatcher, function( fullMatch, url ) {
            if( schemeMatcher.test( url ) ) {
               return fullMatch;
            }
            var fixedUrl = pathPrefix + path.join( sourceDirectory, url.replace( /["']/g, '' ) );
            return 'url("' + fixedUrl + '")';
         } );
      }

   } );
};
