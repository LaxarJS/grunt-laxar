# The "directory_tree" task

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

## Usage examples

### One markdown file

```js
grunt.initConfig( {
   directory_tree: {
      lib: {
         files: {
            'docs/api.md': [ 'lib/**/*.js' ]
         }
      }
   }
} );
```

### Multiple markdown files

```js
grunt.initConfig( {
   directory_tree: {
      lib: {
         files: {
            expand: true,
            cwd: 'lib',
            src: 'lib/**/*.js',
            dest: 'docs/api/',
            ext: '.md'
         }
      }
   }

