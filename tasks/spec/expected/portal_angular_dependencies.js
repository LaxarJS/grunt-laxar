define( [
   '../widgets/default/test_widget/test_widget'
], function() {
   'use strict';

   return [].map.call( arguments, function( module ) { return module.name; } );
} );
