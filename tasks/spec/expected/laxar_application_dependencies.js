define( [
   'laxar-path-controls/ax-test-control/ax-test-control',
   'laxar-application/widgets/default/test_widget/test_widget',
   'laxar-application/widgets/default/local_widget/local_widget',
   'laxar-application/widgets/default/plain_widget/plain_widget'
], function() {
   'use strict';

   var modules = [].slice.call( arguments );
   return {
      'angular': modules.slice( 0, 3 ),
      'plain': modules.slice( 3, 4 )
   };
} );
