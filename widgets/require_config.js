var require = {
   baseUrl: './',
   deps: [
      'bower_components/es5-shim/es5-shim',
      'bower_components/modernizr/modernizr'
   ],
   shim: {
      angular: {
         deps: [
            'jquery'
         ],
         exports: 'angular'
      },
      'angular-mocks': {
         deps: [
            'angular'
         ],
         init: function ( angular ) {
            'use strict';
            return angular.mock;
         }
      },
      'angular-route': {
         deps: [
            'angular'
         ],
         init: function ( angular ) {
            'use strict';
            return angular.route;
         }
      },
      'angular-sanitize': {
         deps: [
            'angular'
         ],
         init: function ( angular ) {
            'use strict';
            return angular;
         }
      },
      underscore: {
         exports: '_',
         init: function () {
            'use strict';
            return this._.noConflict();
         }
      }
   },
   packages: [
      {
         name: 'laxar',
         location: 'bower_components/laxar',
         main: 'laxar'
      },
      {
         name: 'laxar_uikit',
         location: 'bower_components/laxar_uikit',
         main: 'laxar_uikit'
      },
      {
         name: 'laxar_patterns',
         location: 'bower_components/laxar_patterns',
         main: 'laxar_patterns'
      },
      {
         name: 'moment',
         location: 'bower_components/moment',
         main: 'moment'
      }
   ],
   paths: {
      // LaxarJS Core:
      requirejs: 'bower_components/requirejs/require',
      jquery: 'bower_components/jquery/dist/jquery',
      angular: 'bower_components/angular/angular',
      'angular-mocks': 'bower_components/angular-mocks/angular-mocks',
      'angular-route': 'bower_components/angular-route/angular-route',
      'angular-sanitize': 'bower_components/angular-sanitize/angular-sanitize',

      // LaxarJS Core Testing:
      jasmine: 'bower_components/jasmine/lib/jasmine-core/jasmine',
      q_mock: 'bower_components/q_mock/q',

      // LaxarJS Core Legacy:
      text: 'bower_components/requirejs-plugins/lib/text',
      json: 'bower_components/requirejs-plugins/src/json',

      // UIKit:
      jquery_ui: 'bower_components/jquery_ui',
      'bootstrap-tooltip': 'bower_components/bootstrap-sass-official/vendor/assets/javascripts/bootstrap/tooltip',

      // App Parts:
      'laxar-path-root': '.',
      'laxar-path-layouts': 'application/layouts',
      'laxar-path-pages': 'application/pages',
      'laxar-path-widgets': 'widgets',
      'laxar-path-themes': 'themes',
      'laxar-path-flow': 'application/flow/flow.json',

      // Widgets:
      underscore: 'bower_components/underscore/underscore',
      pagedown: 'bower_components/pagedown/pagedown' // Markdown display widget
   }
};
