# Test infrastructure for LaxarJS widgets

These files provide basic standalone testing for LaxarJS widgets.  
**Note**: Your widget needs to specify all it's dependencies in a `bower.json` file.
Also, the name you specify in the JSON file has to match the widget's AngularJS module name.

## Usage

Copy the `package.json` file into your widget directory.

You can now use `npm` for testing and dependency-management:

```console
$ npm install
...
$ npm test
...
```
