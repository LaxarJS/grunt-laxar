/**
 * Copyright 2014 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
/*jshint node: true*/
'use strict';

var path = require( 'path' );

function defaultConfig( baseUrl ) {
   return {
      baseUrl: baseUrl,
      deps: [
         'es5-shim/es5-shim',
         'modernizr/modernizr'
      ],
      shims: {
         'angular': {},
         'jquery': {},
         'underscore': {}
      },
      paths: {
         // LaxarJS Core:
         'requirejs': 'requirejs/require',
         'jquery': 'jquery/dist/jquery',
         'angular': 'angular/angular',
         'angular-mocks': 'angular-mocks/angular-mocks',
         'angular-route': 'angular-route/angular-route',
         'angular-sanitize': 'angular-sanitize/angular-sanitize',

         // LaxarJS Core Testing:
         'jasmine': 'jasmine/lib/jasmine-core/jasmine',
         'q_mock': 'q_mock/q',

         // LaxarJS Core Legacy:
         'text': 'requirejs-plugins/lib/text',
         'json': 'requirejs-plugins/src/json',

         // UIKit:
         'jquery_ui': 'jquery_ui',
         'trunk8': 'trunk8/trunk8',
         'bootstrap-tooltip': 'bootstrap-sass-official/vendor/assets/javascripts/bootstrap/tooltip'
      },
      packages: []
   };
}

/**
 * Add one component
 */
function addComponent( config, component ) {
   var pkg = component.pkgMeta;
   var name = pkg.name;
   var location = path.relative( config.baseUrl, component.canonicalDir );
   var main = typeof pkg.main === 'string' ? path.join( location, pkg.main ).replace( /\.js$/, '' ) : path.join( location, name );

   if( config.shims.hasOwnProperty( name ) ) {
      config.paths[ name ] = main;
   } else if( config.deps.indexOf( main ) < 0 &&
              !config.paths.hasOwnProperty( name ) ) {
      var names = config.packages.map( function( pkg ) {
         return pkg.name;
      } );

      if( names.indexOf( name ) < 0 ) {
         config.packages.push( {
            name: pkg.name,
            main: path.relative( location, main ),
            location: location,
            path: main
         } );
      }
   }
}

/**
 * Add the given bower components
 */
function addComponents( config, components ) {
   for( var component in components ) {
      if( components.hasOwnProperty( component ) ) {
         addComponent( config, components[ component ] );
      }
   }
}


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
