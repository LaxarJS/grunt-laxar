# The *laxar-develop* Task

> Generates *dependencies* and *resource listings* required by the LaxarJS runtime, and starts a *development server*  with live reloading.

This task is an _end-user task_ of grunt-laxar and thus considered part of the public API.

This task simply runs [*laxar-configure*](laxar-configure.md), followed by [*laxar-build*](laxar-build.md).
Finally the third-party tasks [*connect*](https://github.com/gruntjs/grunt-contrib-connect) and [*watch*](https://github.com/gruntjs/grunt-contrib-watch) are run in order to launch a development server with live-reload capabilities.

Because the watch task is configured by *laxar-build*, only files that are relevant to the application are watched for modification, making this process relatively CPU- and battery-friendly.
To avoid watching for modifications entirely, you can use the *[laxar-develop-no-watch](laxar-develop-no-watch.md)* variant of this task.

For a *production build*, additional artifacts must be generated, by using [*laxar-dist*](laxar-dist.md).


## Overview

*Run this task with the `grunt laxar-develop` command.*

This task has no further options.
