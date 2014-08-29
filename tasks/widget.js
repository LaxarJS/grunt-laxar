/**
 * Copyright 2014 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
module.exports = function( grunt ) {
   'use strict';

   var path = require( 'path' );
   var _ = grunt.util._;

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function widgetConfiguration( path, options, config ) {
      options = _.defaults( options, {
         karma: {
            laxar: {
               specRunner: path + '/spec/spec_runner.js',
               requireConfig: 'require_config.js'
            },
            junitReporter: {
               outputFile: path + '/test/test-results.xml'
            },
            coverageReporter: {
               dir: path + '/test'
            }
         },
         jshint: {}
      } );

      return {
         karma: _.defaults( {}, config.karma, {
            options: options.karma
         } ),
         jshint: _.defaults( {}, config.jshint, {
            options: options.jshint,
            src: [ path + '/*.js',
                   path + '/!(bower_components|node_modules)/**/*.js' ]
         } )
      };
   }

   //////////////////////////////////////////////////////////////////////////////////////////////////////////

   grunt.registerMultiTask( 'widget', 'Run widget specific tasks', function() {
      var widget = this.target;
      var options = this.options();

      var config = widgetConfiguration( widget, this.options(), this.data );

      /* if the spec_runner.js does not exist, remove the karma task */
      if( !grunt.file.exists( config.karma.options.laxar.specRunner ) ) {
         grunt.log.warn( 'Widget \'' + widget + '\' has no spec_runner.js!' );
         delete config.karma;
      }

      for( var task in config ) {
         if( config.hasOwnProperty( task ) ) {
            var key = task + '.' + widget;
            grunt.config( key, _.defaults( {}, grunt.config( key ), config[ task ] ) );
         }
      }

      var tasks = arguments.length ? [].slice.apply( arguments ) : Object.keys( config );

      grunt.log.ok( 'Running ' + grunt.log.wordlist( tasks ) + ' for ' + widget );
      grunt.task.run( tasks.map( function( task ) {
         return task + ':' + widget;
      } ) );
   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   grunt.registerTask( 'widgets', 'Run all or matching widget tasks', function( pattern ) {
      var widgets = Object.keys( grunt.config( 'widget' ) ).filter( function( widget ) {
         return (widget !== 'options' );
      } );

      if( pattern ) {
         /* filter the widgets */
         widgets = grunt.file.match( [ pattern ], widgets );
      }

      var tasks = [].slice.call( arguments, 1 );

      grunt.log.ok( 'Running ' + ( tasks.length ? grunt.log.wordlist( tasks ) : 'tasks' ) + ' for ' + widgets.length + ' widgets' );
      tasks.unshift( '' );
      grunt.task.run( widgets.map( function( widget ) {
         tasks[ 0 ] = widget;
         return 'widget:' + tasks.join( ':' );
      } ) );
   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

};
