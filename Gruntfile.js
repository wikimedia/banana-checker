'use strict';

// Integration test
module.exports = function ( grunt ) {
	grunt.loadTasks( './tasks/' );
	grunt.initConfig( {
		banana: {
			testSimple: 'test/simple',
			testAdvanced: {
				src: 'test/advanced/{a,b}',
				options: {
					sourceFile: 'messages.json',
					documentationFile: 'documentation.json'
				}
			}
		}
	} );
};
