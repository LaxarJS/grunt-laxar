# The *laxar-dist* Task

> Prepares your application for production.

After running [*laxar-configure*](laxar-configure.md) and [*laxar-build*](internal/laxar-build.md) this task runs the building block task [*laxar-dist-optimize*](internal/laxar-dist-optimize.md) for each flow target.
This results in the necessary resources and dependencies as well as in the concatenated JavaScript and CSS for each flow, which should be used by your application in production setups.
The `index.html` that comes with the LaxarJS application template uses these artifacts by default.


## Overview

*Run this task with the `grunt laxar-dist` command.*

This task has no further options.
