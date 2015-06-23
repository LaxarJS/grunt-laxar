# The *laxar-test* Task

> Runs spec tests of all widgets that are a direct part of the application

It does not make sense to test the same widget twice only for being part of two flows, so this task pools and processes widgets from all flows.

To test an individual widget, use the task [*laxar-test-widget*](laxar-test-widget.md).


## Overview

*Run this task with the `grunt laxar-test` command.*

Overall test output for all widgets of a flow is written to `{dest}/{target}/tooling/test-results.xml`.

When a single test fails, the task aborts so that you can inspect the output.
You can force *laxar-test* to continue by invoking grunt with the `--continue` option.
In this case, the task prints a warning if any of the tests failed, and you should inspect the output.

This task has no further options.
