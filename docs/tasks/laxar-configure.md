# The *laxar-configure* Task

> Configures all flow-based tasks and their building blocks.

Generates configuration for the internal building-block tasks at `{dest}/{target}/work/task-configuration.json`.
Here, *dest* refers to the configured destination directory (usually `var/flows`), and *target* corresponds to each flow target that was configured (see below).


## Overview

*Run this task with the `grunt laxar-configure` command.*

This is the only task that *requires* configuration.

Here is the example configuration which is also used when creating a new LaxarJS application from the grunt-init [application template](//github.com/LaxarJS/grunt-init-laxar-application):

```js
'laxar-configure': {
   options: {
      workDirectory: 'var/flows',
      flows: [
         { target: 'main', src: 'application/flow/flow.json' }
      ]
   }
}
```

This configuration defines a *flow target* called `main` and associates with this targets all artifacts than can be reached by browsing the flow `application/flow/flow.json`.

Most of the time, you will not need to run this task manually, because it is automatically run whenever starting *laxar-develop*, *laxar-dist* or *laxar-test*.
However, you will need to launch this task when trying to manually trigger building blocks such as *laxar-dist-css* (see below).

You can instruct _laxar-configure_ to only use a single flow target so that the rest is effectively ignored.
To do this, start grunt with the global option _laxar-flow_, e.g. `grunt --laxar-flow=main laxar-develop`.


## Options

### options.workDirectory

Type: `String`
Default value: `var/flows`

The path within your project where task output files are stored.
All *laxar-...* tasks will use this folder, and a subfolder will be created for each flow target.


### options.testDirectory

Type: `String`
Default value: `var/test`

The path within your project where test output files are stored.
All *laxar-test-...* tasks will use this folder, and subfolders will be created for artifacts that are being tested.


### options.userTasks

Type: `Object`
Default value: `{ 'build-flow': [], 'dist-flow': [], 'test-flow': [] }`

Allows to specify additional tasks to be invoked for each flow target, by [laxar-build-flow](internal/laxar-build-flow.md) or by [laxar-build-flow](internal/laxar-build-dist.md) respectively.
These tasks must be multi-tasks and their targets will be configured by _laxar-configure_.

For each flow target, the tasks will be run with a single _dest_, which is the workDirectory option of this task.
Tasks run this way can safely access to the _artifacts model_ of their flow, located under `{dest}/{target}/tooling/artifacts.json`.
You can use this to hook your own flow-based tasks into the _build_ stage, for example to watch and compile [SCSS](http://sass-lang.com) files for a flow, or to perform additional optimizations during the _dist_ stage.


### options.flows

Type: `Array`
Default value: `[]`

A list of flow-targets and their associated flow definitions.
Each entry is an object with a `target` and a `src` property.


#### options.flows.*.target

Type: `String`

The *target* string is used to generate sub-tasks for the building blocks tasks.
Each *target* also gets its own subdirectory within the *workDirectory*.


#### options.flows.*.src

Type: `String`

The *src* property is a file path which is passed on to the ([*laxar-artifacts*](internal/laxar-artifacts.md)) during the build.
It is used to look up the flow definition to be included into the build artifacts for this target.


#### options.flows.*.init

Type: `String`
Default value: `'../init'`

This is the AMD entry module for your flow, which pulls in all dependencies and kicks off the runtime using `laxar.bootstrap()`.
It is needed to produce an optimized bundle using _r.js_ (see [*laxar-dist-js*](internal/laxar-dist-js.md)).


### options.ports

Type: Object

Allows to override the default TCP ports used by *connect* (development, testing) and *watch* (for live reload).
You should modify these ports when developing multiple LaxarJS applications simultaneously.


#### options.ports.develop

Type: Number
Default: 8000

The port that is used by the development web server.
Other *connect* options should be configured directly for that task.
Visit this port in the web browser to try out your LaxarJS application.


#### options.ports.test

Type: Number
Default: 9000

The port that is used by the development web server *for automated testing*.
Other *connect* options should be configured directly for that task.
This should be different from the development port so that testing does not interfere with development.


#### options.ports.livereload

Type: Number
Default: 35729

The port that is used by the *watch* to implement the live-reload channel.
