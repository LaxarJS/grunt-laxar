var require = {
   deps: [ 'es7-shim' ],
   paths: {
      angular: 'even/better/angular'
   },
   map: {
      '*': {
         'underscore': 'lodash'
      },
      'local_dependency': {
         'underscore': 'even-lower-dash'
      }
   },
   shim: {
      lodash: function( _ ) {
         'use strict';
         _.noConflict();
         return _;
      }
   }
};
