# The *laxar-test-configure-flow* Task

> For a given flow target, configure widget tests.

This task collects all widgets for a flow and configures a target of the `laxar-test-widget-internal` task for each of them.


## Overview

*Note:* This task is an *internal building block* used by the grunt-laxar main tasks, and not considered a part of the stable API.

*Run this task with the `grunt laxar-configure laxar-test-configure-flow:{target} laxar-test-widget-internal:{widget-path}` command.*

The possible targets are determined by the [*laxar-test-configure-flow*](laxar-test-configure-flow.md) task.
If used without *laxar-configure*, the task targets, files and options may be specified manually according to the grunt [Configuring tasks](http://gruntjs.com/configuring-tasks) guide.
