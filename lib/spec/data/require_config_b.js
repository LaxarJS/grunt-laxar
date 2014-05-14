/*global requirejs*/
requirejs.config({
   baseUrl: 'test',
   shim: {
      q: {},
      underscore: {}
   },
   paths: {
      a: 'test_a',
      b: 'test_b',
      q: 'test_q',
      underscore: 'test_underscore'
   }
});
