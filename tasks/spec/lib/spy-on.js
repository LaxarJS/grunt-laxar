module.exports = spyOn;

/**
 * Spy on a method, allow to inspect call arguments for each call.
 */
function spyOn( object, methodName ) {
   'use strict';

   var orig = object[ methodName ];
   var configCalls = [];

   object[ methodName ] = spy.bind( object );
   for( var k in orig ) {
      if( orig.hasOwnProperty( k ) ) {
         object[ methodName ][ k ] = orig[ k ];
      }
   }

   return {
      calls: configCalls,
      reset: function() {
         object[ methodName ] = orig;
      }
   };

   function spy() {
      configCalls.push( [].slice.call( arguments ) );
      orig.apply( object, arguments );
   }
}
