/**
 * Copyright 2015 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
module.exports = function( grunt ) {
   'use strict';

   var TASK = 'laxar-info';
   var helpers = require( './lib/task_helpers' )( grunt, TASK );
   var path = require( 'path' );


   grunt.registerTask( TASK,
      'Configures LaxarJS tasks for development, testing and optimization.',
      function() { runInfo(); }
   );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function runInfo() {

      printGeneralInfo();

      var handlers = {
         flow: printFlowInfo,
         page: printPageInfo,
         layout: printLayoutInfo,
         widget: printWidgetInfo,
         control: printControlInfo
      };

      if( grunt.option( 'usage' ) ) {
         printUsageInfo();
         return;
      }

      var hasModels = flowTargets().every( function( flow ) {
         var model = artifactsModel( flow.target );
         if( !model ) {
            grunt.log.warn( 'Cannot find model for flow ' + flow.target + '.' );
            grunt.log.warn( 'Run task laxar-build first.' );
            return false;
         }
         return true;
      } );
      if( !hasModels ) {
         return;
      }


      var handlerArgument;
      var anyHandler = grunt.option( 'any' ) || grunt.option( 'X' );
      var artifactProcessed = false;

      Object.keys( handlers ).forEach( function( key ) {
         handlerArgument = grunt.option( key ) || anyHandler;
         if( !handlerArgument ) {
            return;
         }

         if( handlerArgument === true ) {
            // missing actual argument string
            printUsageInfo();
         }
         else {
            artifactProcessed = artifactProcessed || handlers[ key ]( handlerArgument );
         }
      } );

      if( !artifactProcessed ) {
         if( handlerArgument ) {
            warn( 'The reference ' + handlerArgument + ' does not seem to be used anywhere!' );
         }
         else {
            printProjectInfo();
         }
      }
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function printUsageInfo() {
      writeHead( 'Available laxar-info commands:' );
      write( '  --flow <flow-id>         Print information on the given flow.' );
      write( '                           The ID must be given as specified in the options to' );
      write( '                           laxar-configure (Gruntfile.js).' );
      write( '  --layout <layout-ref>    Print information on the given layout.' );
      write( '                           The layout-ref has the same format as is used in' );
      write( '                           page definitions (and as printed by --flow).' );
      write( '  --widget <widget-ref>    Print information on the given widget.' );
      write( '                           The widget-ref has the same format as is used in' );
      write( '                           page definitions (and as printed by --flow).' );
      write( '  --control <control-ref>  Print information on the given control.' );
      write( '                           The control-ref has the same format as is used in' );
      write( '                           the controls-section of widget.json descriptors' );
      write( '                           (and as printed by --flow).' );
      write( '  --page <page-ref>        Print information on the given page.' );
      write( '                           The page-ref has the same format as is used in' );
      write( '                           flow definitions (and as printed by --flow).' );
      write( '  --any | -X <ref>         Try all artifact types and print information for the first' );
      write( '                           first matching item' );
      write( '  --usage                  Print this information.' );
      write( '                           Without any arguments, available flows are listed.' );
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function printProjectInfo() {
      var flows = flowTargets();
      if( !flows.length ) {
         warn( 'No flow targets found. You need to set options for the task laxar-configure.' );
         showDocLink( 'tasks/laxar-configure.md' );
         return;
      }
      writeOk( 'Configuration (grunt-laxar) seems to be OK!' );

      write( '\nAvailable flow targets:' );
      flows.forEach( function( flow ) {
         writeHead( flow.target );
         writeDetail( 'flow definition', flow.src );
         writeDetail( 'build artifacts', flowDirectory() + path.sep + flow.target + path.sep );
      } );

      write( '\nSpecify --usage for a list of laxar-info commands.' );
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function printFlowInfo( flowId ) {
      var model = artifactsModel( flowId );
      if( !model ) {
         return false;
      }

      writeHead( 'Artifacts of flow target "' + flowId + '"' );

      Object.keys( model )
         .forEach( function( artifactsGroup ) {
            writeHead( artifactsGroup );
            var items = model[ artifactsGroup ];
            if( !items.length ) {
               writeNone();
            }
            items.forEach( function( item ) {
               writeDetail( shortInfo( artifactsGroup, item ) );
            } );
         } );

      return true;

      function shortInfo( group, item ) {
         switch( group ) {
            case 'flows':
               return item.path;
            case 'themes':
               return item.name + '  (' + item.path + path.sep + ')';
            case 'pages':
               return item.references.local.self + '  (' + item.path + ')';
            case 'layouts':
               return item.references.local.self + '   (location: theme-dependent)';
            case 'widgets':
               return item.references.local.self + '  (' + item.path + path.sep + ')';
            case 'controls':
               return item.references.amd.self + '  (' + item.path + path.sep + ')';
            default:
               return '';
         }
      }
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function printPageInfo( pageRef ) {
      var pageItem = null;
      var usingFlowIds = [];
      flowTargets().forEach( function( flow ) {
         var model = artifactsModel( flow.target );
         var maybeItem = model.pages.filter( matchesReference( pageRef, 'file' ) );
         if( maybeItem.length ) {
            usingFlowIds.push( flow.target );
            pageItem = maybeItem[ 0 ];
         }
      } );

      if( !usingFlowIds.length ) {
         return false;
      }

      writeHead( 'Page details for reference "' + pageRef + '":' );
      writeDetail( 'type', 'page' );
      writeDetail( 'path', pageItem.path );

      writeHead( 'Extends / Composes pages:' );
      if( pageItem.pages.length ) {
         pageItem.pages.forEach( function( _ ) { writeDetail( _ ); } );
      }
      else {
         writeNone();
      }

      writeHead( 'Uses widgets:' );
      if( pageItem.widgets.length ) {
         pageItem.widgets.forEach( function( _ ) { writeDetail( _ ); } );
      }
      else {
         writeNone();
      }

      return true;
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function printLayoutInfo( layoutRef ) {
      var layoutItem = null;
      var usingFlowIds = [];
      var themeItems = [];
      flowTargets().forEach( function( flow ) {
         var model = artifactsModel( flow.target );
         var maybeItem = model.layouts.filter( matchesReference( layoutRef, 'file' ) );
         if( maybeItem.length ) {
            usingFlowIds.push( flow.target );
            themeItems = model.themes;
            layoutItem = maybeItem[ 0 ];
         }
      } );

      if( !usingFlowIds.length ) {
         return false;
      }

      writeHead( 'Layout details for reference "' + layoutRef + '":' );
      writeDetail( 'type', 'layout' );

      writeHead( 'Used by flows: ' );
      usingFlowIds
         .forEach( function( _ ) { writeDetail( _ ); } );

      printResourcePaths( layoutItem, themeItems );

      return true;
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function printWidgetInfo( widgetRef ) {
      var widgetItem = null;
      var usingFlowIds = [];
      var usingPages = [];
      var themeItems = [];
      flowTargets().forEach( function( flow ) {
         var model = artifactsModel( flow.target );
         var maybeItem = model.widgets.filter( matchesReference( widgetRef, 'file' ) );
         if( maybeItem.length ) {
            usingFlowIds.push( flow.target );
            usingPages = usingPages.concat( model.pages
               .filter( function( p ) { return p.widgets.indexOf( widgetRef ) !== -1; } )
               .map( function( _ ) { return _.references.local.self; } )
               .filter( function( p ) { return usingPages.indexOf( p ) === -1; } ) );
            themeItems = model.themes;
            widgetItem = maybeItem[ 0 ];
         }
      } );

      if( !usingFlowIds.length ) {
         return false;
      }

      writeHead( 'Widget details for reference "' + widgetRef + '":' );
      writeDetail( 'type', widgetItem.integration.type );
      writeDetail( 'technology', widgetItem.integration.technology );
      writeDetail( 'path', widgetItem.path );
      writeDetail( 'AMD module', widgetItem.references.amd.module );

      writeHead( 'Used by flows: ' );
      usingFlowIds
         .forEach( function( _ ) { writeDetail( _ ); } );

      writeHead( 'Used on pages: ' );
      usingPages
         .forEach( function( _ ) { writeDetail( _ ); } );

      writeHead( 'Uses controls: ' );
      if( widgetItem.controls.length ) {
         widgetItem.controls.forEach( function( _ ) { writeDetail( _ ); } );
      }
      else {
         writeNone();
      }

      printResourcePaths( widgetItem, themeItems );

      return true;
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function printControlInfo( controlRef ) {
      var controlItem = null;
      var usingFlowIds = [];
      var usingWidgets = [];
      var themeItems = [];
      flowTargets().forEach( function( flow ) {
         var model = artifactsModel( flow.target );
         var maybeItem = model.controls.filter( matchesReference( controlRef, 'amd' ) );
         if( maybeItem.length ) {
            usingFlowIds.push( flow.target );
            usingWidgets = usingWidgets.concat( model.widgets
               .filter( function( w ) { return w.controls.indexOf( controlRef ) !== -1; } )
               .map( function( _ ) { return _.references.local.self; } )
               .filter( function( w ) { return usingWidgets.indexOf( w ) === -1; } ) );
            themeItems = model.themes;
            controlItem = maybeItem[ 0 ];
         }
      } );

      if( !usingFlowIds.length ) {
         return false;
      }

      writeHead( 'Control details for reference "' + controlRef + '":' );
      writeDetail( 'type', controlItem.integration.type );
      writeDetail( 'technology', controlItem.integration.technology );
      writeDetail( 'path', controlItem.path );
      writeDetail( 'AMD module', controlItem.references.amd.module );

      writeHead( 'Used by flows: ' );
      usingFlowIds
         .forEach( function( _ ) { writeDetail( _ ); } );

      writeHead( 'Used by widgets: ' );
      usingWidgets
         .forEach( function( _ ) { writeDetail( _ ); } );

      printResourcePaths( controlItem, themeItems );

      return true;
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function printResourcePaths( artifactItem, themeItems ) {
      write( '' );
      themeItems.forEach( function( themeItem ) {
         writeHead( themeItem.name + ':' );
         write( '' );
         var relevantThemeItems = [ themeItem ].concat(
            themeItem.name !== 'default.theme' ? [ { name: 'default.theme'} ] : []
         );
         var resourcePaths = helpers.getResourcePaths( relevantThemeItems, 'list' )( artifactItem );

         var pathsByBaseName = groupBy(
            resourcePaths.filter( isForTheme( themeItem ) ),
            function( _ ) { return _.split( path.sep ).pop(); }
         );

         Object.keys( pathsByBaseName ).forEach( function( baseName ) {
            writeDetail( baseName );
            pathsByBaseName[ baseName ].reduce( function( seen, resourcePath ) {
               var exists = grunt.file.exists( resourcePath );
               var isActive = !seen && exists;
               var folder = resourcePath.slice( 0, resourcePath.length - baseName.length );
               writeDetail(
                  '[ ' + (isActive ? 'ACTIVE' : (exists ? 'exists' : '      ')) + ' ] ' + folder,
                  null,
                  3
               );
               return seen || exists;
            }, false );
            write( '' );
         } );
      } );
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function printGeneralInfo() {
      // Read available flows directly from the laxar-configure task options:
      var manifest;
      try {
         manifest = readJson( 'bower.json' );
      }
      catch( e ) {
         warn( 'No Bower manifest found! Is this a LaxarJS project?' );
         manifest = { name: '<unknown>' };
      }
      writeHead( 'LaxarJS project:', manifest.name );
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   /**
    * @param {String} reference
    *   A reference such as 'my-category/some-widget', 'amd:organization-widget', 'file:cat/sub/other-widget'.
    * @param defaultProtocol
    *   The protocol to use if the reference does not contain a protocol (such as 'amd', 'file' etc).
    * @returns {Function}
    */
   function matchesReference( reference, defaultProtocol ) {
      var protocol = defaultProtocol;
      var parts = reference.split( ':' );
      if( parts.length > 1 ) {
         protocol = parts[ 0 ];
         reference = parts.slice( 1, parts.length - 1 ).join( ':' );
      }

      return function( item ) {
         return item.references[ protocol ].self === reference;
      };
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function write() {
      grunt.log.writeln.apply( grunt.log, arguments );
   }

   function writeDetail( title, value, level ) {
      level = level === undefined ? 2 : level;
      var indent = level === 1 ? '' : (level === 2 ? '  - ' : '      ' );
      ( level === 1 ? writeHead : write )( indent + title + ( value ? ': ' + value : '' ) );
   }

   function writeHead() {
      grunt.log.subhead.apply( grunt.log, arguments );
   }

   function writeOk() {
      grunt.log.ok.apply( grunt.log, arguments );
   }

   function writeNone() {
      write( '   <none>' );
   }

   function warn() {
      grunt.log.warn.apply( grunt.log, arguments );
   }

   function flowDirectory() {
      var configDir = grunt.config.get( 'laxar-configure.options.workDirectory' );
      return configDir !== undefined ? configDir : 'var/flows';
   }

   function flowTargets() {
      return grunt.config.get( 'laxar-configure.options.flows' ) || [];
   }

   var cache = {};
   function artifactsModel( flowId ) {
      if( cache[ flowId ] ) {
         return cache[ flowId ];
      }
      var artifactsFile = path.join( flowDirectory(), flowId, helpers.ARTIFACTS_FILE );
      if( grunt.file.exists( artifactsFile ) ) {
         cache[ flowId ] = readJson( artifactsFile );
         return cache[ flowId ];
      }
      return null;
   }

   function readJson( fileName ) {
      return grunt.file.readJSON( fileName );
   }

   function isForTheme( themeItem ) {
      return function( path ) {
         return [ 'default.theme', themeItem.name ].some( function( themeName ) {
            return path.indexOf( '/' + themeName + '/' ) !== -1 || path.indexOf( themeName + '/' ) === 0;
         } );
      };
   }

   function groupBy( list, f ) {
      return list.reduce( function( buckets, val ) {
         var key = f( val );
         buckets[ key ] = ( buckets[ key ] || [] ).concat( val );
         return buckets;
      }, {} );
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function showDocLink( path ) {
      var DOC_ROOT = 'https://github.com/LaxarJS/grunt-laxar/blob/master/docs/';
      grunt.log.writeln( 'Refer to the documentation at: ' + DOC_ROOT + path );
   }

};
