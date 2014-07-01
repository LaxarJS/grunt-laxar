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

      var config = require( '../lib/require_config' )( options.requireConfig, options );
      var paths = require( '../lib/laxar_paths' )( config, options );

      var base = options.base;
      var pathToDefaultTheme = path.resolve( paths.DEFAULT_THEME );
      var pathToThemes = path.resolve( paths.THEMES );
      var pathToLayouts = path.resolve( paths.LAYOUTS );
      var pathToWidgets = path.resolve( paths.WIDGETS );

      grunt.file.mkdir( options.output );

      collectThemes().forEach( function( theme ) {
         var css = fixUrls( grunt.file.read( theme.mainFile ), theme.mainFile, options.output );
         var output = options.output + '/' + theme.name + '.css';

         css += readLayouts( theme, pathToLayouts );
         css += readWidgets( theme, pathToWidgets );

         grunt.file.write( output, css );
         grunt.log.ok( 'Created merged css file in "' + output + '".' );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      function collectThemes() {
         var themes = [];
         function processThemeDir( dir, themeName ) {
            var cssMainFile = dir + '/css/theme.css';
            if( grunt.file.exists( cssMainFile ) ) {
               themes.push( {
                  name: themeName || dir.replace( pathToThemes + '/', '' ),
                  mainFile: cssMainFile
               } );
            }
         }
         processThemeDir( pathToDefaultTheme, options.defaultTheme );
         grunt.file.expand( pathToThemes + '/*.theme' ).forEach( processThemeDir );

         return themes;
      }

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      function readLayouts( theme, path ) {
         var layoutsRead = [];

         // As layouts don't have such a strict folder structure as widgets have (there it is always
         // *category*/*widgetName*), we need to find a html file of the layout and then derive the folder
         // structure from there.
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
               return css + getFixedCssForThemeFromFolder( theme, layoutPath );
            }

            return css;
         }, '' );
      }

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      function readWidgets( theme, path ) {
         return grunt.file.expand( path + '/*/*/' ).reduce( function( css, assetDir ) {
            return css + getFixedCssForThemeFromFolder( theme, assetDir );
         }, '' );
      }

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      function getFixedCssForThemeFromFolder( theme, path ) {
         var tmp = path.split( '/' );
         var layoutName = tmp[ tmp.length - 2 ];
         var fileName = getCandidate( [
            path + theme.name + '/css/' + layoutName + '.css',
            path + options.defaultTheme + '/css/' + layoutName + '.css',
            path + 'css/' + layoutName + '.css' // deprecated old directory layout
         ] );

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
         return css.replace( urlMatcher, function( fullMatch, url, index ) {
            if( schemeMatcher.test( url ) ) {
               return fullMatch;
            }
            var fixedUrl = pathPrefix + path.join( sourceDirectory, url.replace( /["']/g, '' ) );
            return 'url("' + fixedUrl + '")';
         } );
      }

   } );
};
