#!/usr/bin/env node

var fs = require( 'fs' );
var path = require( 'path' );
var fork = require( 'child_process' ).fork;

var nodeModules = path.resolve( __dirname + '/../node_modules' );
var phantomjs = path.dirname( require.resolve( 'karma-phantomjs-launcher' ) ) + '/node_modules/phantomjs';

fs.exists( phantomjs + '/lib/phantom', function( exists ) {
   if( !exists ) {
      var child = fork( phantomjs + '/install.js', {
         cwd: phantomjs
      } );

      child.on( 'close', function( code ) {
         process.exit( code );
      } );
   }
} );
