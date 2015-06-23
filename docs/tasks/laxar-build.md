# The *laxar-build* Task

> Builds the required artifacts for all flow targets.

After running [*laxar-configure*](laxar-configure.md), this task runs the building block tasks belonging to [*laxar-build-flow*](internal/laxar-build-flow.md).
This results in concatenated JavaScript and CSS for each flow, which should be used by your application in production setups.
The `index.html` that comes with the LaxarJS application template uses these artifacts by default.


## Overview

*Run this task with the `grunt laxar-build` command.*

This task has no further options.
