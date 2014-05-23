# The "portal_angular_dependencies" task

The `portal_angular_dependencies` task parses an application's
flow, resolves the pages and determines the widgets and controls
used in those pages.
From the list of widgets and controls it creates a *RequireJS* module
that consists of a list of all the required module's names.

## Overview

*Run this task with the `grunt portal_angular_dependencies` command.*

Task targets, files and options may be specified according to the grunt
[Configuring tasks](http://gruntjs.com/configuring-tasks) guide.

## Options

### options.base

Type: `String`  
Default value: `.`

The path to your project.

### options.laxar

Type: `String`  
Default value: `laxar`

The RequireJS module name that resolves to Laxar.

### options.pages

Type: `String`  
Default value: `laxar-path-pages`

A path that RequireJS can resolve that points to your pages.

### options.widgets

Type: `String`  
Default value: `laxar-path-widgets`

A path that RequireJS can resolve that points to your widgets.

### options.requireConfig

Type: `String`  
Default value: `require_config.js`

The path to your RequireJS configuration file.

## Usage examples

### Single flow, single output

```js
grunt.initConfig( {
   portal_angular_dependencies: {
      default: {
         'var/portal_angular_dependencies.js': [ 'application/flow/flow.json' ]
      }
   }
} );
```

### Multiple flows, single output

```js
grunt.initConfig( {
   portal_angular_dependencies: {
      default: {
         'var/portal_angular_dependencies.js': [ 'application/flow/*.json' ]
      }
   }
} );
```

### Multiple flows, multiple outputs

```js
grunt.initConfig( {
   portal_angular_dependencies: {
      default: {
         'var/portal_angular_dependencies_one.js': [ 'application/flow/flow_one.json' ],
         'var/portal_angular_dependencies_two.js': [ 'application/flow/flow_two.json' ]
      }
   }
} );
```

