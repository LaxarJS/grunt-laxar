/**
 * Copyright 2014 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
module.exports = function( requireConfig, opts ) {
   'use strict';

   var fs = require( 'fs' );
   var path = require( 'path' );
   var _ = require( 'lodash' );

   var options = _.defaults( {
      base: '.',
      globals: {},
      paths: {
         q: require.resolve( 'q' ).replace( /\.js$/, '' ),
         underscore: require.resolve( 'lodash' ).replace( /\.js$/, '' )
      }
   }, opts );

   var base = options.base;
   var globals = options.globals;
   var paths = options.paths;

   var template = fs.readFileSync( __dirname + '/require_config.tmpl' );
   var context = {
      globals: Object.keys( globals ),
      requireConfig: fs.readFileSync( path.resolve( requireConfig ) )
   };

   // Evaluate the given require configuration.
   // Trust me, JSHint, I know what I'm doing.
   /*jshint -W054*/
   var config = new Function( 'globals', _.template( template, context ) )( globals );

   var baseUrl = path.resolve( path.relative( base || '.', config.baseUrl ) );

   config.baseUrl = baseUrl;
   config.deps = [];
   config.paths = config.paths || {};

   Object.keys( paths ).forEach( function( module ) {
      if( config.paths.hasOwnProperty( module ) ) {
         delete config.shim[ module ];
         config.paths[ module ] = paths[ module ];
      }
   } );

   return config;
};
