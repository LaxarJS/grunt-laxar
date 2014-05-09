/**
 * Copyright 2014 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
module.exports = function( grunt ) {
   'use strict';

   var minimatch = require( 'minimatch' );
   var path = require( 'path' );

   var object;
   var rules;

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function isPrimitive( value ) {
      return [ 'string', 'number', 'boolean' ].indexOf( typeof value ) !== -1;
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function deepEnumerate( val, results, prefix ) {
      results = results || {};
      prefix = prefix || '';

      if( isPrimitive( val ) ) {
         results[ prefix ] = val;
      }
      else if( Array.isArray( val ) ) {
         results[ prefix ] = val;
         prefix += ( prefix.length ? '.' : '' );
         val.forEach( function( item, index ) {
            deepEnumerate( val[ index ], results, prefix + index );
         } );
      }
      else if( typeof val === 'object' ) {
         results[ prefix ] = val;
         prefix += ( prefix.length ? '.' : '' );
         Object.keys( val ).forEach( function( key ) {
            deepEnumerate( val[ key ], results, prefix + key );
         } );
      }

      return results;
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   var actionHandlers = {
      RENAME: function( instance, rule  ) {
         var matches = deepEnumerate( instance.features );
         Object.keys( matches ).filter( minimatchPredicate( rule.pattern ) ).forEach( function( path ) {
            var parentPath = path.substring( 0, path.lastIndexOf( '.' ) );
            var parent = object.path( instance.features, parentPath );
            var fromName = path.substring( path.lastIndexOf( '.' ) + 1 );
            grunt.log.writeln( 'Upgrade:      RENAME: (' + instance.widget +  '):' +
               parentPath + '[' + fromName + ' -> ' + rule.to + ']' );
            parent[ rule.to ] = parent[ fromName ];
            delete parent[ fromName ];
         } );
         return instance;
      },

      UNWRAP_SINGLE: function( instance, rule ) {
         var matches = deepEnumerate( instance.features );
         Object.keys( matches ).filter( minimatchPredicate( rule.pattern ) ).forEach( function( path ) {
            var parentPath = path.substring( 0, path.lastIndexOf( '.' ) );
            var child = object.path( instance.features, path );
            var wrapper = object.path( instance.features, parentPath );
            if( Object.keys( wrapper ).length === 1 ) {
               grunt.log.writeln( 'Upgrade:      UNWRAP_SINGLE: (' + instance.widget +  '):' +
                  parentPath + '[' + path.substring( path.lastIndexOf( '.' ) + 1 ) + ' -> .]' );
               object.setPath( instance.features, parentPath, child );
            }
         } );
         return instance;
      },

      MOVE: function( instance, rule ) {
         var matches = deepEnumerate( instance.features );
         Object.keys( matches ).filter( minimatchPredicate( rule.pattern ) ).forEach( function( path ) {
            var parentPath = path.substring( 0, path.lastIndexOf( '.' ) );
            var child = object.path( instance.features, path );
            var parent = object.path( instance.features, parentPath );
            var fromName = path.substring( path.lastIndexOf( '.' ) + 1 );
            var newParentPath = rule.to.substring( 0, rule.to.lastIndexOf( '.' ) );
            var newKey = rule.to.substring( rule.to.lastIndexOf( '.' ) + 1 );
            grunt.log.writeln( 'Upgrade:      MOVE: (' + instance.widget +  '): ' +
               parentPath + '.' + fromName + ' -> ' + newParentPath + '.' + newKey );
            object.setPath( instance.features, rule.to, child );
            delete parent[ fromName ];
            if( Object.keys( instance.features[ parentPath ] ).length  === 0 ) {
               delete instance.features[ parentPath ];
            }
         } );

         return instance;
      }
   };

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function minimatchPredicate( pattern ) {
      var minimatchPattern = pattern.replace( /\\./g, '/' );
      return function( objectPath ) {
         var minimatchPath = objectPath.replace( /\\./g, '/' );
         return minimatch( minimatchPath, minimatchPattern );
      };
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function applyRule( widgetInstance, rule ) {
      var workingCopy = JSON.parse( JSON.stringify( widgetInstance ) );
      return actionHandlers[ rule.action ]( workingCopy, rule );
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function transformWidgetInstance( instance ) {
      var widget = instance.widget;
      if( !widget || !( widget in rules ) ) {
         return instance;
      }
      grunt.verbose.writeln( 'Upgrade ATP33>34:    - ' + instance.widget );
      return rules[ widget ].reduce( applyRule, instance );
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function processPage( page, pagePath, pathToPages ) {
      if( 'areas' in page ) {
         // page, composition
         Object.keys( page.areas ).forEach( function( areaName ) {
            grunt.verbose.writeln( 'Upgrade ATP33>34: >> "' + pagePath + '"#' + areaName );
            page.areas[ areaName ] = page.areas[ areaName ].map( transformWidgetInstance );
         } );
      }
      if( 'widgets' in page ) {
         // mixin
         grunt.verbose.writeln( 'Upgrade ATP33>34: >> "' + pagePath + '"#widgets' );
         page.widgets = page.widgets.map( transformWidgetInstance );
      }
      if( 'extends' in page ) {
         var extendsPath = path.join( path.dirname( pagePath ), page[ 'extends' ] );
         page[ 'extends' ] = extendsPath.replace( pathToPages + '/', '' );
      }
      return page;
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function processPagePath( pagePath, mode, pathToPages ) {
      var BACKUP_SUFFIX = '.backup.json';

      var backupPath;
      if( mode === 'revert' ) {
         grunt.verbose.writeln( 'Upgrade ATP33<34: >> "' + pagePath + '": restoring backup file' );
         backupPath = pagePath;
         pagePath = backupPath.replace( /(.*)[.]backup.json$/, '$1.json' );
         grunt.file.copy( backupPath, pagePath );
         grunt.file[ 'delete' ]( backupPath );
      }
      else if( mode === 'prune' ) {
         grunt.log.writeln( 'Upgrade ATP33>34: >> "' + pagePath + '": pruning backup file' );
         grunt.file[ 'delete' ]( pagePath );
      }
      else {
         if( pagePath.indexOf( BACKUP_SUFFIX ) === pagePath.length - BACKUP_SUFFIX.length ) {
            grunt.verbose.writeln( 'Upgrade ATP33>34: >> "' + pagePath + '": skipping backup file' );
            return;
         }
         backupPath = pagePath.replace( /(.*)[.]json$/, '$1' + BACKUP_SUFFIX );
         if( grunt.file.exists( backupPath ) ) {
            // do not overwrite existing backup:
            grunt.verbose.writeln( 'Upgrade ATP33>34: >> "' + pagePath + '": backup already exists' );
         }
         else {
            grunt.verbose.writeln( 'Upgrade ATP33>34: >> "' + pagePath + '": creating backup: ', backupPath );
            grunt.file.copy( pagePath, backupPath );
         }

         var pageJson = grunt.file.readJSON( pagePath );
         var resultJson = processPage( pageJson, pagePath, pathToPages );
         grunt.file.write( pagePath, JSON.stringify( resultJson, undefined, 3 ) + '\n' );
      }
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   grunt.registerMultiTask(
      'upgrade_pages',
      'Translate widget instance configurations in laxar pages using a set of rules',
      function() {
         var options = this.options( {
            base: '.',
            appRoot: 'laxar-path-root',
            laxar: 'laxar',
            pages: 'laxar-path-pages',
            widgets: 'laxar-path-widgets',
            requireConfig: 'require_config.js'
         } );

         var config = require( '../lib/require_config' )( options.requireConfig, options );
         var requirejs = require( 'requirejs' ).config( config );
         var objectUrl = options.laxar + '/lib/utilities/object';
         object = requirejs( objectUrl );

         rules = options.rules;

         var fileSets = this.files;
         var target = this.target;
         fileSets.forEach( function( fileSet ) {
            fileSet.src.forEach( function( file ) {
               grunt.verbose.writeln( 'Upgrade ATP33>34: Page "' + file + '"' );
               var pathToPages =
                  requirejs.toUrl( options.pages ).replace( requirejs.toUrl( options.appRoot ) + '/', '' );
               processPagePath( '' + file, target, pathToPages );
            } );
         } );
      } );
};
