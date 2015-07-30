# The *laxar-info* Task

> Prints information about LaxarJS application artifacts to the command line

This task uses the artifacts model produced by [*laxar-build*](laxar-build.md) and provides information on individual artifacts.

In particular, it tells you which resources (CSS/HTML) are used for which artifact, and under which theme. 


## Overview

*Run this task with the `grunt laxar-info` command.*

Usually, you will alias the task to `info` in your Gruntfile, so that you can use it like this.

```console
# print general project information (e.g. which flow targets are available)
grunt info

# print usage information
grunt info --usage

# try all artifact types,
# print information on the first type for which this is a reference
grunt info -X some-artifact-reference


# print information on the flow-target _main_
grunt info --flow main

# print information on the page `my/page`
grunt info --page my/page

# print information on the widget with file reference `cat/my-widget`
grunt info --widget cat/my-widget

# print information on the control with AMD path `laxar-input-control`
grunt info --control laxar-path-control

# print information on the layout `my/layout`
grunt info --layout my/layout
```
