# The "laxar_dox" task

The `laxar_dox` task uses [laxar_dox][axdox] to output API documentation in markdown
format.

[axdox]: https://github.com/LaxarJS/laxar_dox
  "laxar_dox: A JavaScript API doc generator using dox to output markdown files"

## Overview

*Run this task with the `grunt laxar_dox` command.*

Task targets, files and options may be specified according to the grunt
[Configuring tasks](http://gruntjs.com/configuring-tasks) guide.

## Options

_None_

## Usage examples

### One markdown file

```js
grunt.initConfig( {
   laxar_dox: {
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
   laxar_dox: {
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
} );
```
