/**
 * Copyright 2014 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
var fs = require( 'fs' );
var path = require( 'path' );
var _ = require( 'lodash' );

/**
 * Load a configuration file for RequireJS and return
 * the config object.
 * If the configuration specifies paths for 'underscore' and/or
 * 'q', those will be replaced by local node modules.
 *
 * @param {String} file
 *    the config file
 * @param {Objecŧ} [options]
 *    additional options:
 *    - `base`: interpret the config file's `baseUrl` as
 *      relative to this directory
 *    - `globals`: export the given grobals the the require
 *      configuration script
 *
 * @return {Object}
 *    the configuration object
 */
module.exports = requirejsFactory;
module.exports.configuration = configuration;
module.exports.fromConfiguration = fromConfiguration;
module.exports.helper = helper;
module.exports.baseOptions = baseOptions;

var URL_SEP = '/';

//////////////////////////////////////////////////////////////////////////////////////////////////////////////

function helper( baseDir ) {
   'use strict';
   var requirejsConfig = configuration();
   var requirejs = fromConfiguration( requirejsConfig );

   var api = {
      projectPath: function( requireRef ) {
         var absolutePath = requirejs.toUrl( requireRef ).split( URL_SEP ).join( path.sep );
         return path.relative( baseDir, absolutePath );
      },

      projectRef: function( requireRef ) {
         return [ 'laxar-application' ]
            .concat( api.projectPath( requireRef ).split( path.sep ) )
            .join( URL_SEP );
      }
   };
   return api;
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////

function fromConfiguration( requireConfiguration ) {
   'use strict';
   return require( 'requirejs' ).config( requireConfiguration );
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////

function configuration( options ) {
   'use strict';

   options = options || baseOptions();

   var requireConfiguration = requirejsFactory( options.requireConfig, options );
   requireConfiguration.paths.laxar = path.dirname( require.resolve( 'laxar' ) );
   return requireConfiguration;
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////

function baseOptions() {
   'use strict';
   return {
      base: '.',
      laxar: 'laxar',
      defaultTheme: 'laxar-path-default-theme',
      themes: 'laxar-path-themes',
      layouts: 'laxar-path-layouts',
      pages: 'laxar-path-pages',
      controls: 'laxar-path-controls',
      widgets: 'laxar-path-widgets',
      requireConfig: 'require_config.js',
      applicationPackage: 'laxar-application'
   };
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////

function requirejsFactory( file, options ) {
   'use strict';

   options = _.defaults( {
      paths: {
         jjv: requirePath( 'jjv/lib/jjv' ),
         jjve: requirePath( 'jjve' ),
         q: requirePath( 'q' ),
         underscore: requirePath( 'lodash' )
      },
      packages: [
         requirePackage( 'laxar' )
      ]
   }, options, {
      base: '.',
      globals: {}
   } );

   var base = options.base;
   var globals = options.globals;
   var paths = options.paths;

   var template = fs.readFileSync( __dirname + '/require_config.tmpl' );
   var context = {
      globals: Object.keys( globals ),
      requireConfig: fs.readFileSync( path.resolve( file ) )
   };

   // Evaluate the given require configuration.
   // Trust me, JSHint, I know what I'm doing.
   /*jshint -W054*/
   var config = new Function( 'globals', _.template( template, context ) )( globals );

   config.baseUrl = path.resolve( base || '.', config.baseUrl );
   config.deps = [];
   config.paths = config.paths || {};

   Object.keys( paths ).forEach( function( module ) {
      if( config.paths.hasOwnProperty( module ) ) {
         if( config.shim ) {
            delete config.shim[ module ];
         }
         config.paths[ module ] = paths[ module ];
      }
   } );

   return config;

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function requirePath( module ) {
      return require.resolve( module ).replace( /\.js$/, '' );
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function requirePackage( module ) {
      var file = require.resolve( path.join( module, 'package.json') );
      var info = require( file );
      return {
         name: info.name,
         location: path.dirname( file ),
         main: info.main.replace( /\.js$/, '' )
      };
   }

}
