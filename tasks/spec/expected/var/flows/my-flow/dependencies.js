define( [
   'laxar-path-controls/ax-old-style-control/ax-old-style-control/ax-old-style-control',
   'laxar-path-controls/ax-test-control/ax-new-style-control',
   'laxar-application/widgets/default/local_widget/local_widget',
   'laxar-application/widgets/default/test_widget/test_widget',
   'laxar-application/widgets/default/plain_widget/plain_widget'
], function() {
   'use strict';

   var modules = [].slice.call( arguments );
   return {
      'angular': modules.slice( 0, 4 ),
      'plain': modules.slice( 4, 5 )
   };
} );
