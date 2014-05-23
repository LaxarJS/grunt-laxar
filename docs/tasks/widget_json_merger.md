# The "widget_json_merger" task

The `widget_json_merger` task merges `widget.json` files.

## Overview

*Run this task with the `grunt widget_json_merger` command.*

Task targets, files and options may be specified according to the grunt
[Configuring tasks](http://gruntjs.com/configuring-tasks) guide.

## Options

### options.base

Type: `String`  
Default value: `.`

The path to your project.

### options.widgets

Type: `String`  
Default value: `laxar-path-widgets`

A path that RequireJS can resolve that points to your widgets.

### options.output

Type: `String`  
Default value: `var/static`

The directory to write the `widgets.js` file to.

### options.requireConfig

Type: `String`  
Default value: `require_config.js`

The path to your RequireJS configuration file.

## Usage examples

### Default options

```js
grunt.initConfig( {
   widget_json_merger: {
      default: {}
   }
} );
```
