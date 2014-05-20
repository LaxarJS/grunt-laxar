define( [], function() {
   'use strict';

   /**
    * This is a test class.
    * @param {String} name a name
    */
   function Test( name ) {
      this.name_ = name;
   }

   /**
    * This is a test method.
    * @return {String} the name
    */
   Test.prototype.getName = function getName() {
      return this.name_;
   };


   return {
      /**
       * This is a test function.
       * @param {String} name a name
       * @return {Object} a new Test instance
       */
      create: function( name ) {
         return new Test( name );
      }
   };
} );
