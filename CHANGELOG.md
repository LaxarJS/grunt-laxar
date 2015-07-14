# Changelog

## Last Changes


## v1.1.0-alpha.2

- [#65](https://github.com/LaxarJS/grunt-laxar/issues/65): laxar-resources: normalized task result
    + NEW FEATURE: see ticket for details
- [#64](https://github.com/LaxarJS/grunt-laxar/issues/64): added Travis-CI build integration
    + NEW FEATURE: see ticket for details
- [#63](https://github.com/LaxarJS/grunt-laxar/issues/63): added regression tests for the new flow-based tasks
    + NEW FEATURE: see ticket for details


## v1.1.0-alpha.1

- [#41](https://github.com/LaxarJS/grunt-laxar/issues/41): added new flow-based tasks
    + NEW FEATURE: see ticket for details


## v1.1.0-alpha.0

- [#62](https://github.com/LaxarJS/grunt-laxar/issues/62): karma-laxar: upgraded to latest 1.1.0 alpha
- [#61](https://github.com/LaxarJS/grunt-laxar/issues/61): widgets: fixed support for widgets using dist-package references


## v1.0.0
## v1.0.0-beta.2

- [#60](https://github.com/LaxarJS/grunt-laxar/issues/60): css_merger: fixed default.theme lookup


## v1.0.0-beta.1

- [#59](https://github.com/LaxarJS/grunt-laxar/issues/59): css_merger: fixed loading of nested layout CSS


## v1.0.0-beta.0

- [#57](https://github.com/LaxarJS/grunt-laxar/issues/57): page_loader: laxar is now used as node module


## v1.0.0-alpha.10

- [#56](https://github.com/LaxarJS/grunt-laxar/issues/56): widgets: added support for new-style controls and modules
- [#52](https://github.com/LaxarJS/grunt-laxar/issues/52): tests: made all `grunt-laxar` tests pass on Windows
- [#37](https://github.com/LaxarJS/grunt-laxar/issues/37): css_merger: fixed paths and URLs for Windows


## v1.0.0-alpha.9

- [#55](https://github.com/LaxarJS/grunt-laxar/issues/55): css_merger: added support for new-style controls (with descriptor)
- [#53](https://github.com/LaxarJS/grunt-laxar/issues/53): laxar_application_dependencies: remove laxar submodule; use npm instead
- [#51](https://github.com/LaxarJS/grunt-laxar/issues/51): laxar_application_dependencies: fixed laxar path for require config
- [#50](https://github.com/LaxarJS/grunt-laxar/issues/50): laxar_application_dependencies: added lookup of control.json for actual control name


## v1.0.0-alpha.8

- [#49](https://github.com/LaxarJS/grunt-laxar/issues/49): laxar_application_dependencies: fixed dependencies
- [#48](https://github.com/LaxarJS/grunt-laxar/issues/48): documentation: updated to newest laxar dox version


## v1.0.0-alpha.7

- [#47](https://github.com/LaxarJS/grunt-laxar/issues/47): laxar_application_dependencies: turned internal laxar dependency into git submodule
- [#46](https://github.com/LaxarJS/grunt-laxar/issues/46): documentation: refactored laxar_dox task and added public documentation task


## v1.0.0-alpha.6

- [#43](https://github.com/LaxarJS/grunt-laxar/issues/43): css_merger: load CSS from themes
    + NEW FEATURE: see ticket for details


## v1.0.0-alpha.5

- [#44](https://github.com/LaxarJS/grunt-laxar/issues/44): laxar_application_dependencies: use laxar-application package to allow for using relative AMD-paths from widgets, even with plugins
    + **BREAKING CHANGE:** see ticket for details
- [#42](https://github.com/LaxarJS/grunt-laxar/issues/42): laxar_application_dependencies: cleaned up some fallout of (#29)


## v1.0.0-alpha.4

- [#39](https://github.com/LaxarJS/grunt-laxar/issues/39): widget: updated `karma-laxar` to automatically load `es5-shim`
    + NEW FEATURE: see ticket for details
- [#29](https://github.com/LaxarJS/grunt-laxar/issues/29): portal_angular_dependencies: renamed to laxar_application_dependencies
    + **BREAKING CHANGE:** see ticket for details
- [#25](https://github.com/LaxarJS/grunt-laxar/issues/25): Removed the now obsolete widget_json_merger task.
    + **BREAKING CHANGE:** see ticket for details


## v1.0.0-alpha.3

- [#40](https://github.com/LaxarJS/grunt-laxar/issues/40): portal_angular_dependencies, css_merger: refactored portal artifacts to runtime and loaders.
    + **BREAKING CHANGE:** see ticket for details
- [#31](https://github.com/LaxarJS/grunt-laxar/issues/31): portal_angular_dependencies: fixed handling of missing integration field
- [#28](https://github.com/LaxarJS/grunt-laxar/issues/28): widgets: added support for more integration technologies.
    + **BREAKING CHANGE:** see ticket for details


## v0.8.0

- [#38](https://github.com/LaxarJS/grunt-laxar/issues/38): css_merger: find custom theme folders within widgets
- [#6](https://github.com/LaxarJS/grunt-laxar/issues/6): css_merger: fixed imports by URL
- [#36](https://github.com/LaxarJS/grunt-laxar/issues/36): css_merger: fix incorrect CSS output path and `url()`s for windows
- [#35](https://github.com/LaxarJS/grunt-laxar/issues/35): widget dependencies: fixed URL generation for windows


## v0.7.0

- [#32](https://github.com/LaxarJS/grunt-laxar/issues/32): widget dependencies: fixed URL generation for windows
- [#34](https://github.com/LaxarJS/grunt-laxar/issues/34): widgets: fixed package configuration
- [#33](https://github.com/LaxarJS/grunt-laxar/issues/33): widget: jshint should ignore embedded projects


## v0.6.0

- [#30](https://github.com/LaxarJS/grunt-laxar/issues/30): directory_tree: better JSON syntax error reporting
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
    + NEW FEATURE: see ticket for details
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
    + NEW FEATURE: see ticket for details
- [#5](https://github.com/LaxarJS/grunt-laxar/issues/5): css_merger: fixed default.theme handling (laxar_uikit) and absolute css urls
- [#2](https://github.com/LaxarJS/grunt-laxar/issues/2): Finally, added a lot of tests
- [#1](https://github.com/LaxarJS/grunt-laxar/issues/1): Made lookup of Grunt tasks more resilient
