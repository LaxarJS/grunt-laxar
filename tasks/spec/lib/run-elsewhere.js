var path = require( 'path' );
var runTask = require( 'grunt-run-task' );

module.exports = run;

///////////////////////////////////////////////////////////////////////////////////////////////////////////

function run( task, taskConfig, newBase, done ) {
   var previousBase = path.resolve( '.' );
   runTask.grunt.file.setBase( newBase );
   runTask.task( task, taskConfig ).run( function( err ) {
      runTask.grunt.file.setBase( previousBase );
      done( err );
   } );
}
