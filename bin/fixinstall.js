#!/usr/bin/env node

var fs = require( 'fs' );
var path = require( 'path' );
var fork = require( 'child_process' ).fork;

var phantomjs = path.dirname( require.resolve( 'karma-phantomjs-launcher' ) ) + '/node_modules/phantomjs';

fs.exists( phantomjs + '/lib/phantom', function( installed ) {
   'use strict';

   if( installed ) {
      return;
   }

   fs.exists( phantomjs + '/install.js', function( installerFound ) {
      if( !installerFound ) {
         return;
      }
      var child = fork( phantomjs + '/install.js', {
         cwd: phantomjs
      } );
      child.on( 'close', function( code ) {
         process.exit( code );
      } );
   } );
} );
