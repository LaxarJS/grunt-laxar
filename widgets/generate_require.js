/**
 * Copyright 2014 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
/*jshint node: true*/
'use strict';

var path = require( 'path' );

var staticConfig = {
   deps: [
      'es5-shim/es5-shim'
   ],
   shims: {
      'angular': {},
      'angular-mocks': {},
      'angular-route': {},
      'angular-sanitize': {},
      'jquery': {},
      'underscore': {},
      'json-patch': {}
   }
};

function defaultConfig( baseUrl ) {
   return {
      baseUrl: baseUrl,
      deps: [],
      shims: {},
      paths: {
         // LaxarJS Core:
         'requirejs': 'requirejs/require',
         'text': 'requirejs-plugins/lib/text',
         'json': 'requirejs-plugins/src/json',

         // LaxarJS Core Testing:
         'jasmine': 'jasmine/lib/jasmine-core/jasmine',
         'q_mock': 'q_mock/q',

         // LaxarJS 0.x control paths:
         'bootstrap-tooltip': 'bootstrap-sass-official/assets/javascripts/bootstrap/tooltip',
         'bootstrap-affix': 'bootstrap-sass-official/assets/javascripts/bootstrap/affix',
         'jquery_ui': 'jquery_ui/ui',

         // LaxarJS 1.x controls paths:
         'bootstrap': 'bootstrap-sass-official/assets/javascripts/bootstrap',
         'jquery-ui': 'jquery-ui',

         // LaxarJS Patterns dependencies:
         'json-patch': 'fast-json-patch/src/json-patch-duplex'
      },
      packages: []
   };
}

/**
 * Add a single component
 */
function addComponent( config, component ) {
   var pkg = component.pkgMeta;
   var name = pkg.name;

   var packageLocation = path.relative( config.baseUrl, component.canonicalDir );
   var main = typeof pkg.main === 'string' ?
      path.join( packageLocation, pkg.main ).replace( /\.js$/, '' ) :
      path.join( packageLocation, name );
   var mainRelative = path.relative( packageLocation, main );

   // Workaround to make laxar-* bundles work as common-js modules:
   if( mainRelative.indexOf( 'dist/' ) === 0 ) {
      packageLocation = path.join( packageLocation, 'dist' );
      mainRelative = mainRelative.replace( /^dist[/]/, '' );
   }

   if( staticConfig.shims.hasOwnProperty( name ) ) {
      config.paths[ name ] = main;
   } else if( staticConfig.deps.indexOf( main ) >= 0 ) {
      if( config.deps.indexOf( main ) < 0 ) {
         config.deps.push( main );
      }
   } else if( !config.paths.hasOwnProperty( name ) ) {
      var names = config.packages.map( function( pkg ) {
         return pkg.name;
      } );

      if( names.indexOf( name ) < 0 ) {
         config.packages.push( {
            name: pkg.name,
            main: mainRelative,
            location: packageLocation,
            path: main
         } );
      }
   }
}

/**
 * Add a list of bower components
 */
function addComponents( config, components ) {
   for( var component in components ) {
      if( components.hasOwnProperty( component ) ) {
         addComponent( config, components[ component ] );
      }
   }
}

/**
 * Add the dependencies of a single bower component
 */
function addDependencies( config, component ) {
   var dependencies = component.dependencies;
   var len = config.packages.length;
   if( dependencies ) {
      addComponents( config, dependencies );
      if( len < config.packages.length ) {
         for( var dependency in dependencies ) {
            addDependencies( config, dependencies[ dependency ] );
         }
      }
   }
}

module.exports = function( directory, list ) {
   var config = defaultConfig( directory );
   addDependencies( config, list );
   return config;
};
