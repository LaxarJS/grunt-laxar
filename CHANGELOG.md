# Changelog

## Last Changes

- [#27](https://github.com/LaxarJS/grunt-laxar/issues/27): widgets: removed marked configuration
- [#26](https://github.com/LaxarJS/grunt-laxar/issues/26): widgets: add jquery_ui require path
- [#24](https://github.com/LaxarJS/grunt-laxar/issues/24): css_merger: fixed handling of protocol-relative URLs
- [#23](https://github.com/LaxarJS/grunt-laxar/issues/23): the plugin provides a new Option `--continue` to keep running tasks after failures but keep a proper return code.
- [#22](https://github.com/LaxarJS/grunt-laxar/issues/22): Added path to bootstrap affix control.
- [#21](https://github.com/LaxarJS/grunt-laxar/issues/21): the Gruntfile provided for widget tests now create coverage reports.


## v0.5.0

- [#19](https://github.com/LaxarJS/grunt-laxar/issues/19): we're now using our own _Karma_ and _grunt-karma_ forks so that we can respond to issues more quickly.
- [#18](https://github.com/LaxarJS/grunt-laxar/issues/18): there is a new script `bin/fixinstall` to fix the PhantomJS installation if it's broken.
- [#17](https://github.com/LaxarJS/grunt-laxar/issues/17): there are two new tasks to merge `test-results.xml` and `lcov.info` files.
  NEW FEATURE: see ticket for details
- [#16](https://github.com/LaxarJS/grunt-laxar/issues/16): the karma-task is now configured to easily create coverage reports.
- [#15](https://github.com/LaxarJS/grunt-laxar/issues/15): the `require_config.js`, that is generated for widgets, now contains static configuration for Marked.
- [#13](https://github.com/LaxarJS/grunt-laxar/issues/13): the `require_config.js`, that is generated for widgets, now contains the proper configuration for JSON-patch.


## v0.4.0

- [#11](https://github.com/LaxarJS/grunt-laxar/issues/11): Improved readability of directory listing for connect task.
- [#10](https://github.com/LaxarJS/grunt-laxar/issues/10): Fixed processing of multiple non-default themes
- [#3](https://github.com/LaxarJS/grunt-laxar/issues/3): add some documentation
- [#8](https://github.com/LaxarJS/grunt-laxar/issues/8): widget tests: automatically generate a *RequireJS* configuration (instead of using a static one)
- [#7](https://github.com/LaxarJS/grunt-laxar/issues/7): css_merger: fixed theme processing for widgets and controls


## v0.3.0

- [#4](https://github.com/LaxarJS/grunt-laxar/issues/4): directory_tree: allowed to embed files into listings using option embedContents
  NEW FEATURE: see ticket for details
- [#5](https://github.com/LaxarJS/grunt-laxar/issues/5): css_merger: fixed default.theme handling (laxar_uikit) and absolute css urls
- [#2](https://github.com/LaxarJS/grunt-laxar/issues/2): Finally, added a lot of tests
- [#1](https://github.com/LaxarJS/grunt-laxar/issues/1): Made lookup of Grunt tasks more resilient
