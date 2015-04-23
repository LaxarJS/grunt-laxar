define( [
   'angular'
], function( ng ) {
   'use strict';

   Controller.$inject = [ '$scope' ];

   function Controller( $scope ) {
      /* :) */
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   return ng.module( 'testWidget', [] ).controller( 'TestWidgetController', Controller );

} );
