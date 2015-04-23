# grunt-laxar

> Grunt tasks for LaxarJS

`grunt-laxar` provides a couple of custom tasks for *LaxarJS* applications
and default configurations for tasks from the Grunt community.

```console
$ grunt directory_tree portal_angular_dependencies connect karma watch
        └─1──────────┘ └─2───────────────────────┘ └─3───┘ └─4─┘ └─5─┘

  1) create filesystem map in JSON
  2) collect dependencies for AngularJS
  3) start connect
  4) run Karma tests
  5) wait for changes
```

## Getting started

This plugin requires Grunt `~0.4.4`. In case you have not used Grunt before, be
sure to have a look at the [Getting Started](http://gruntjs.com/getting-started)
guide.

To use this plugin, your first need to install it using [NPM](https://npmjs.org):

```console
$ npm install
```

After that, load its tasks from your Gruntfile:

```js
grunt.loadNpmTasks( 'grunt-laxar' );
```

## Included tasks

- [`css_merger`](docs/tasks/css_merger.md):
  Merge multiple CSS files into one file.
- [`directory_tree`](docs/tasks/directory_tree.md):
  Generate a JSON mapping of files inside a specific directory tree.
- [`laxar_dox`](docs/tasks/laxar_dox.md):
  Create API documentation in Markdown.
- [`portal_angular_dependencies`](docs/tasks/portal_angular_dependencies.md):
  Generate a *RequireJS* module to bootstrap *AngularJS*.

### Third party tasks

- [`connect`](http://github.com/gruntjs/grunt-contrib-connect):
  Start a static web server.
- [`jshint`](http://github.com/gruntjs/grunt-contrib-jshint):
  Validate files with JSHint.
- [`karma`](http://github.com/karma-runner/grunt-karma):
  Run [Karma](http://karma-runner.github.io/0.12/index.html).
- [`requirejs`](http://github.com/gruntjs/grunt-contrib-requirejs):
  Optimize *RequireJS* projects using *r.js*.
