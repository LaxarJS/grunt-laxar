# Documentation

## laxarPaths( config, [options] ) = require( './lib/laxar_paths' )
Use laxar and the given require configuration to resolve
the paths/constants that laxar uses.

### Parameters
- **config {Object}**: the require configuration to use

- **_options_ {Object}**: overrides


### Returns
- **{Object}**: an object containig the path laxar constants `PRODUCT`,
`THEMES`, `LAYOUTS`, `WIDGETS`, `PAGES`, `FLOW_JSON`,
`DEFAULT_THEME`.

----

## mktree( base, filelist, callback ) = require( './lib/mktree' )
Take a list of files and represent the directory tree
as a javascript object.

### Parameters
- **base {String}**: the base directory for files

- **filelist {Array}**: a list of filenames

- **callback {Function}**: a nodejs style callback taking an error instance as
the first parameter or the directory tree as the second


### Returns
- **{Object}**: the promise of the whole operation

----

## requireConfig( file, [options] ) = require( './lib/require_config' )
Load a configuration file for RequireJS and return
the config object.
If the configuration specifies paths for 'underscore' and/or
'q', those will be replaced by local node modules.

### Parameters
- **file {String}**: the config file

- **_options_ {Objecŧ}**: additional options:
- `base`: interpret the config file's `baseUrl` as
relative to this directory
- `globals`: export the given grobals the the require
configuration script


### Returns
- **{Object}**: the configuration object

