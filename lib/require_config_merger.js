/**
 * Copyright 2015 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
exports.REQUIRE_CONFIG_NAME = 'require_config.js';
exports.create = function( log ) {
   'use strict';

   var REQUIRE_CONFIG_NAME = exports.REQUIRE_CONFIG_NAME;
   var INDENT_DEPTH = 3;
   var LOG_PREFIX = 'requireConfigMerger: ';

   var fs = require( 'fs' );
   var q = require( 'q' );
   var path = require( 'path' );
   var _ = require( 'lodash' );

   var readFile = q.denodeify( fs.readFile );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   var api = {
      merge: merge
   };

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function merge( requireConfigPaths ) {
      return q.all( requireConfigPaths.map( function( requireConfigPath ) {
         return readFile( path.join( requireConfigPath, REQUIRE_CONFIG_NAME ), 'utf-8' )
            .then( function( content ) {
               return { path: requireConfigPath, content: content };
            } );
      } ) )
         .then( function( requireInfos ) {
            var mergedConfig = requireInfos
               .filter( function( requireInfos ) {
                  return !!requireInfos.content;
               } )
               .map( parseContents )
               .reduce( mergeRequireConfigs, {} );

            var result =
               '/*jshint quotmark:false,-W079*/\n' + // ignore quote type and possible redefinition of require
               'var require = ' + serializeConfig( mergedConfig, 0 ) + ';';
            return result;
         } );
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function parseContents( requireInfo ) {
      var code = 'return (function() { ' + requireInfo.content + '; return require; })();';
      /* jshint evil:true */
      return {
         path: requireInfo.path,
         config: new Function( code )()
      };
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function mergeRequireConfigs( existingConfig, appendeeInfo ) {
      var configToAppend = appendeeInfo.config;
      Object.keys( configToAppend )
         .forEach( function( prop ) {
            if( !configToAppend.hasOwnProperty( prop ) ) {
               return;
            }

            if( !existingConfig.hasOwnProperty( prop ) ) {
               existingConfig[ prop ] = configToAppend[ prop ];
               return;
            }

            if( mergers.hasOwnProperty( prop ) ) {
               mergers[ prop ]( existingConfig, appendeeInfo, configToAppend[ prop ] );
            }
            // anything else won't be merged or overwritten
         } );

      return existingConfig;
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   var mergers = {

      deps: function( config, appendeeInfo, propertyConfig ) {
         config.deps = _.union( config.deps, propertyConfig );
      },

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      paths: function( config, appendeeInfo, propertyConfig ) {
         Object.keys( propertyConfig )
            .forEach( function( moduleName ) {
               if( isConfiguredAsPackage( moduleName, config ) ) {
                  log.warn( LOG_PREFIX + 'WARN:', '"' + moduleName + '" is already configured as package. ' +
                     'Skipping path configuration.' );
                  return;
               }
               var modulePath = propertyConfig[ moduleName ];
               if( config.paths.hasOwnProperty( moduleName ) && config.paths[ moduleName ] !== modulePath ) {
                  // Whenever an already configured path for a module differs from the configured path of
                  // another require configuration, we add a map entry in that modules path mapping
                  if( !config.hasOwnProperty( 'map' ) ) {
                     config.map = {};
                  }
                  if( !config.map.hasOwnProperty( appendeeInfo.path ) ) {
                     config.map[ appendeeInfo.path ] = {};
                  }

                  var appendeeMap = config.map[ appendeeInfo.path ];
                  if( !appendeeMap.hasOwnProperty( moduleName ) ) {
                     appendeeMap[ moduleName ] = modulePath;
                  }
               }
               else {
                  config.paths[ moduleName ] = modulePath;
               }
            } );
      },

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      shim: function( config, appendeeInfo, propertyConfig ) {
         config.shim = _.assign( propertyConfig, config.shim );
      },

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      map: function( config, appendeeInfo, propertyConfig ) {
         if( !config.map ) {
            config.map = {};
         }

         Object.keys( propertyConfig )
            .forEach( function( mapRootDir ) {
               var newMapRootDir = path.join( appendeeInfo.path, mapRootDir === '*' ? '' : mapRootDir );
               var mapping = propertyConfig[ mapRootDir ];
               if( !config.map.hasOwnProperty( newMapRootDir ) ) {
                  config.map[ newMapRootDir ] = mapping;
               }
               else {
                  _.assign( config.map[ newMapRootDir ], mapping );
               }
            } );
      },

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      packages: function( config, appendeeInfo, propertyConfig ) {
         propertyConfig.forEach( function( newPackage ) {
            if( !config.packages.some( function( _ ) { return _.name === newPackage.name; } ) ) {
               config.packages.push( newPackage );
            }
         } );
      }

   };

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function serializeConfig( object, indentLevel ) {
      if( Array.isArray( object ) ) {
         if( object.length === 0 ) {
            return '[]';
         }
         return '[\n' + indentString( indentLevel + 1 ) +
            object
               .map( function( entry ) { return serializeConfig( entry, indentLevel + 1 ); } )
               .join( ',\n' + indentString( indentLevel + 1 ) ) +
            '\n' + indentString( indentLevel ) + ']';
      }

      if( Object.prototype.toString.call( object ) === '[object Object]' ) {
         return '{ ' +
            Object.keys( object )
               .map( function( key ) {
                  return '\n' + indentString( indentLevel + 1 ) +
                     JSON.stringify( key ) + ': ' +
                     serializeConfig( object[ key ], indentLevel + 1 );
               } ).join( ', ') +
            '\n' + indentString( indentLevel ) + '}';
      }

      if( typeof object === 'function' ) {
         return object.toString();
      }

      return JSON.stringify( object );
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function isConfiguredAsPackage( moduleName, config ) {
      var modulePrefix = moduleName.split( '/' )[0];
      return ( config.packages || [] ).some( function( packageConfig ) {
         return packageConfig.name === modulePrefix;
      } );
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function indentString( indentLevel ) {
      if( indentLevel <= 0 ) {
         return '';
      }
      return new Array( indentLevel * INDENT_DEPTH + 1 ).join( ' ' );
   }

   return api;

};
