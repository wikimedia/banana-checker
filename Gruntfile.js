/*!
 * Grunt file
 */

/*jshint node:true */
module.exports = function ( grunt ) {
	grunt.loadNpmTasks( 'grunt-contrib-jshint' );
	grunt.loadNpmTasks( 'grunt-contrib-watch' );
	grunt.loadNpmTasks( 'grunt-jscs-checker' );
	grunt.loadTasks( './tasks/' );

	grunt.initConfig( {
		pkg: grunt.file.readJSON( 'package.json' ),
		jshint: {
			options: JSON.parse( grunt.file.read( '.jshintrc' )
				.replace( /\/\*(?:(?!\*\/)[\s\S])*\*\//g, '' ).replace( /\/\/[^\n\r]*/g, '' ) ),
			all: ['*.js', '{tasks,test}/**/*.js']
		},
		jscs: {
			src: '<%= jshint.all %>'
		},
		banana: {
			simple: 'test/simple',
			lesssimple: {
				src: 'test/simple',
				options: {
					sourceFile: 'en.json',
					documentationFile: 'qqq.json'
				}
			},
			advanced: {
				src: 'test/advanced/{a,b}',
				options: {
					sourceFile: 'messages.json',
					documentationFile: 'documentation.json'
				}
			}
		},
		watch: {
			files: ['<%= jshint.all %>', '.{jshintrc,jshintignore}'],
			tasks: ['test']
		}
	} );

	grunt.registerTask( 'test', ['jshint', 'jscs', 'banana'] );
	grunt.registerTask( 'default', 'test' );
};
