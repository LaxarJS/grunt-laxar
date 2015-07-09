# The "css_merger" task

> This task is *deprecated*. Have a look at [laxar-dist-css](internal/laxar-dist-css.md) instead.

The `css_merger` task merges CSS files.

## Overview

*Run this task with the `grunt css_merger` command.*

Task targets, files and options may be specified according to the grunt
[Configuring tasks](http://gruntjs.com/configuring-tasks) guide.

## Options

### options.base

Type: `String`  
Default value: `.`

The path to your project.

### options.themes

Type: `String`  
Default value: `laxar-path-themes`

A path that RequireJS can resolve that points to your themes.

### options.layouts

Type: `String`  
Default value: `laxar-path-layouts`

A path that RequireJS can resolve that points to your layouts.

### options.widgets

Type: `String`  
Default value: `laxar-path-widgets`

A path that RequireJS can resolve that points to your widgets.

### options.output

Type: `String`  
Default value: `var/static/css`

The directory to write CSS files to.

### options.defaulTheme

Type: `String`  
Default value: `default.theme`

The name of the default theme.

### options.requireConfig

Type: `String`  
Default value: `require_config.js`

The path to your RequireJS configuration file.

## Usage examples

### Default options

```js
grunt.initConfig( {
   css_merger: {
      default: {}
   }
} );
```
