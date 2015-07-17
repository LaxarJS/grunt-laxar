# The "directory_tree" task

> This task is *deprecated*. Have a look at [laxar-resources](internal/laxar-resources.md) instead.

The `directory_tree` task takes a list of files and generates a JSON file
that resembles the directory tree represented by these files.

## Overview

*Run this task with the `grunt directory_tree` command.*

Task targets, files and options may be specified according to the grunt
[Configuring tasks](http://gruntjs.com/configuring-tasks) guide.

## Options

### options.base

Type: `String`  
Default value: `.`

The path to your project.

### options.embedContents

Type: `Array<String>`
Default: []

Source files matching any of these patterns will be embedded into the generated listing.
This is recommended for efficient loading of HTML and JSON assets in production setups.


## Usage examples

In this example, the task is used to generate listings for `application` and for selected `laxar-uikit` resources living in `bower_components`:

```js
grunt.initConfig( {
   directory_tree: {
      application: {
         dest: 'var/listing/application_resources.json',
         src: [
            'application/+(flow|pages)/**/*.json',
            'application/layouts/**/*.+(css|html)'
         ],
         options: {
            embedContents: [
               'application/(flow|pages)/**/*.json',
               'application/layouts/**/*.html'
            ]
         }
      },
      bower_components: {
         dest: 'var/listing/bower_components_resources.json',
         src: [
            'bower_components/laxar_uikit/themes/**/*.css',
            'bower_components/laxar_uikit/controls/**/*.+(css|html)'
         ],
         options: {
            embedContents: [ 
               'bower_components/laxar-uikit/controls/**/*.html' 
            ]
         }
      }
   }
} );
