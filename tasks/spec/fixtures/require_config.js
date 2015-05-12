require.config( {
   baseUrl: 'bower_components',
   packages: [
      {
         name: 'laxar',
         location: 'laxar',
         main: 'laxar'
      },
      {
         name: 'laxar_uikit',
         location: 'laxar_uikit',
         main: 'laxar_uikit'
      },
      {
         name: 'laxar_uikit',
         location: 'laxar_uikit',
         main: 'laxar_uikit'
      },
      {
         name: 'laxar-application',
         location: '..',
         main: 'init'
      }
   ],
   paths: {
      json: 'requirejs-plugins/src/json',
      text: 'requirejs-plugins/lib/text',

      test_lib: '../libs/test_lib/test',

      jjv: 'jjv/lib/jjv',
      jjve: 'jjve/jjve',
      'json-patch': 'fast-json-patch/src/json-patch-duplex',

      underscore: 'underscore/underscore',
      q: 'q/q',

      'laxar-path-root': '..',
      'laxar-path-layouts': '../application/layouts',
      'laxar-path-pages': '../application/pages',
      'laxar-path-controls': '../controls',
      'laxar-path-widgets': '../widgets',
      'laxar-path-themes': '../themes',
      'laxar-path-flow': '../application/flow/flow.json'
   }
} );
