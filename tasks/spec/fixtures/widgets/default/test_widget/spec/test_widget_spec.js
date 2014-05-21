define( [
   '../test_widget',
   'laxar/laxar_testing'
], function( widgetModule, ax ) {
   'use strict';

   describe( 'A TestWidget', function() {

      var testBed_;

      beforeEach( function setup() {
         testBed_ = ax.testing.portalMocksAngular.createControllerTestBed( widgetModule.name );
         testBed_.featuresMock = {};

         testBed_.useWidgetJson();
         testBed_.setup();
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      afterEach( function() {
         testBed_.tearDown();
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'still needs some tests.' );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

   } );
} );
