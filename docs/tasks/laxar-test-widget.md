# The *laxar-test-widget* Task

> Runs spec tests for a single widget

Executes a single widget's spec test using [*karma*](http://karma-runner.github.io).


## Overview

*Run this task with the `grunt laxar-test-widget:path/to/widget` command.*

Test output is printed to standard out, and an XML report is written to `var/test/path/to/widget/test-results.xml`.

This task has no further options.


## Options

### options.testDirectory

Type: `String`
Default value: `var/test`

The path within your project where test output files are stored.
All *laxar-test-...* tasks will use this folder, and sub-folders will be created for artifacts that are being tested.
