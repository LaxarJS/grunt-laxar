define( [ 'angular' ], function( ng ) {
   'use strict';

   return ng.module( 'myModule' )

      /**
       * This is an AngularJS factory.
       *
       * @name myFactory
       * @injection
       */
      .factory( 'myFactory', function() {

         return {

            /**
             * This does nothing
             *
             * @param {String} input
             *    some input
             *
             * @memberOf myFactory
             */
            someMethod: function( input ) {

            }
         }

      } );

} );
