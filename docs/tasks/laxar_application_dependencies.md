# The "laxar_application_dependencies" Task

> This task is *deprecated*. Have a look at [laxar-dependencies](internal/laxar-dependencies.md) instead.

The `laxar_application_dependencies` task parses an application's flow, resolves the pages and determines the widgets and controls used on those pages.
From the list of widgets and controls it creates a *RequireJS* module that consists of a list of all the required modules' names, grouped by integration technology.
Typically, this module is required from your main javascript file, such as `init.js` when using the [grunt-init-laxar-application](https://github.com/LaxarJS/grunt-init-laxar-application) template, and used to bootstrap your LaxarJS application.


## Overview

*Run this task with the `grunt laxar_application_dependencies` command.*

Task targets, files and options may be specified according to the grunt [Configuring tasks](http://gruntjs.com/configuring-tasks) guide.


## Options

### options.base

Type: `String`  
Default value: `.`

The path to your project root.

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


## Usage Examples

Usually you will use this task to collect a single set of dependencies from a single application flow.
If you use a different approach, make sure to structure your initialization code accordingly.

### Single Flow, Single Output

```js
grunt.initConfig( {
   laxar_application_dependencies: {
      default: {
         'var/laxar_application_dependencies.js': [ 'application/flow/flow.json' ]
      }
   }
} );
```

### Multiple Flows, Single Output

```js
grunt.initConfig( {
   laxar_application_dependencies: {
      default: {
         'var/laxar_application_dependencies.js': [ 'application/flow/*.json' ]
      }
   }
} );
```

### Multiple Flows, Multiple Outputs

```js
grunt.initConfig( {
   laxar_application_dependencies: {
      default: {
         'var/laxar_application_dependencies_one.js': [ 'application/flow/flow_one.json' ],
         'var/laxar_application_dependencies_two.js': [ 'application/flow/flow_two.json' ]
      }
   }
} );
```
