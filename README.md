# grunt-laxar [![Build Status](https://travis-ci.org/LaxarJS/grunt-laxar.svg?branch=master)](https://travis-ci.org/LaxarJS/grunt-laxar)

> Grunt tasks for LaxarJS

`grunt-laxar` provides a couple of custom [Grunt](http://gruntjs.com/) tasks for [LaxarJS](http://laxarjs.org) applications, plus matching default configuration for several tasks from the Grunt community.

```console
$ grunt laxar-test laxar-build laxar-dist laxar-develop
        └─1──────┘ └─2───────┘ └─3──────┘ └─4─────────┘

  1) run widget tests
  2) generate required application artifacts, bring your own server
  3) generate an optimized version for production (may take a bit longer)
  4) do a build, then run a development server with live-reload of changes
```


## Getting Started

This plugin requires Grunt `~0.4.4`.
In case you have not used Grunt before, be sure to have a look at its [Getting Started](http://gruntjs.com/getting-started) guide.

To use this plugin, you first need to install it using [npm](https://npmjs.org):

```console
$ npm install grunt-laxar
```

After that, load its tasks from your Gruntfile:

```js
grunt.loadNpmTasks( 'grunt-laxar' );
```


## Main Tasks

These are the *bread-and-butter* tasks for developing and optimizing your LaxarJS application.
Usually, the only task that you will have to configure *manually* is `laxar-configure`.

These tasks form the *public API* for grunt-laxar, and any change in their configuration or end-result is subject to the *semantic versioning* of this package.

### ⚙ *laxar-configure*

Configures all flow-based tasks and their building blocks.
This is the only task that requires manual configuration *([more](docs/tasks/laxar-configure.md))*.

### ⚙ *laxar-build*

Generates all artifacts that are needed to develop your application on an existing web server *([more](docs/tasks/laxar-build.md))*.

### ⚙ *laxar-develop*

Generates *dependencies* and *resource listings* required by the LaxarJS runtime, and starts a *development server* with live reloading *([more](docs/tasks/laxar-develop.md))*.

### ⚙ *laxar-dist*

Prepares your application for production *([more](docs/tasks/laxar-dist.md))*.

### ⚙ *laxar-test*

Runs the spec tests of all widgets that are a direct part of the application *([more](docs/tasks/laxar-test.md))*.

### ⚙ *laxar-test-widget*

Runs the spec test of an individual widget *([more](docs/tasks/laxar-test-widget.md))*.

### ⚙ *laxar-dox*

Create API documentation in Markdown format ([more](docs/tasks/laxar-dox.md)).


## Internal Building-Block Tasks

These tasks are used *under the hood* by the main tasks listed above.

Usually you do not need to know the details on these tasks, but sometimes you can save a few seconds by only running the sub-tasks you need, instead of the whole toolchain.
The APIs of these tasks and their intermediate output is considered *internal*, so that behavior may change in incompatible ways between minor versions of grunt-laxar.

All of these tasks are multitasks that must be configured once for each set of flows that they may handle.
Thus, If your Gruntfile contains the *laxar-configure* settings given above, you would (re)create the artifacts model for the main flow by executing:

```console
grunt laxar-configure laxar-artifacts:main
```

The easiest way to generate the required configuration is by running *laxar-configure* before launching any of these tasks.
The main tasks listed above do that for you out of the box.

### ⚙ *laxar-build-flow*

For a given flow target, generates all artifacts that are needed to run that flow in the browser during development *([more](docs/tasks/internal/laxar-build-flow.md))*.

⚙ **laxar-artifacts**

For a given flow target, collects all reachable artifacts and produce an *artifacts model* in JSON format *([more](docs/tasks/internal/laxar-artifacts.md))*.

⚙ **laxar-resources**

For a given flow target, determines static assets (JSON, CSS, HTML) from the artifacts model in order to produce a *resources listing* in JSON format *([more](docs/tasks/internal/laxar-resources.md))*.

⚙ **laxar-dependencies**

For a given flow target, generates an AMD module that references all direct dependencies *([more](docs/tasks/internal/laxar-dependencies.md))*.

⚙ **laxar-configure-watch**

For a given flow target, generates configuration for  [*watch*](https://github.com/gruntjs/grunt-contrib-watch) targets *([more](docs/tasks/internal/laxar-configure-watch.md))*.

### ⚙ *laxar-dist-flow*

For a given flow target, produces optimized assets (CSS, JavaScript) *([more](docs/tasks/internal/laxar-dist-optimize.md))*.

⚙ **laxar-dist-js**

For a given flow target, uses [*r.js*](http://requirejs.org/docs/optimization.html) to create an optimized JavaScript bundle *([more](docs/tasks/internal/laxar-dist-js.md))*.

⚙ **laxar-dist-css**

For a given flow target, uses [*clean-css*](https://github.com/jakubpawlowicz/clean-css) (via [*cssmin*](https://github.com/gruntjs/grunt-contrib-cssmin)) in order to create a single, optimized CSS file for each theme *([more](docs/tasks/internal/laxar-dist-css.md))*.


## Deprecated Tasks

These tasks were originally available for LaxarJS v0.x and have similar objectives to the tasks listed above.
Yhese tasks are kept for compatibility only, because they shipped with LaxarJS v1.0.
It is recommended to instead use the tasks listed above, which are flow-aware and much less likely to cause CPU problems due to rampant watchers.

- [`css_merger`](docs/tasks/css_merger.md):
  Merge multiple CSS files into one file.
- [`directory_tree`](docs/tasks/directory_tree.md):
  Generate a JSON mapping of files inside a specific directory tree.
- [`laxar_application_dependencies`](docs/tasks/laxar_application_dependencies.md):
  Generate a *RequireJS* module to bootstrap *AngularJS*.
- [`test_results_merger`](docs/tasks/test_results_merger.md):
  Merges XML test results.


## Third-Party Tasks

These tasks are automatically configured by *grunt-laxar* to work with a LaxarJS application.
Starting with grunt-laxar v1.1.0, it is recommended not to use these tasks directly but to use the main tasks above.
If using these tasks directly, try not to rely on the current pre-configuration performed by grunt-laxar.
In the future, configuration for these tasks may be *scoped* to affect only specific named targets defined by grunt-laxar
This way, configuration will not influence any (alias) tasks defined by yourself.

- [`connect`](http://github.com/gruntjs/grunt-contrib-connect):
  Start a static web server.
- [`jshint`](http://github.com/gruntjs/grunt-contrib-jshint):
  Validate files with JSHint.
- [`karma`](http://github.com/karma-runner/grunt-karma):
  Run [Karma](http://karma-runner.github.io/0.12/index.html).
- [`requirejs`](http://github.com/gruntjs/grunt-contrib-requirejs):
  Optimize *RequireJS* projects using *r.js*.
- [`connect`](http://github.com/gruntjs/grunt-contrib-connect):
  Start a static web server.
- [`watch`](http://github.com/gruntjs/grunt-contrib-connect):
  Run tasks whenever watched files change.
