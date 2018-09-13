/*!
 * Grunt file
 */

/* eslint-env node */
module.exports = function ( grunt ) {
	grunt.loadNpmTasks( 'grunt-eslint' );
	grunt.loadNpmTasks( 'grunt-contrib-watch' );
	grunt.loadTasks( './tasks/' );

	grunt.initConfig( {
		eslint: {
			all: [ '*.js', '{tasks,test}/**/*.js' ]
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
			},
			disallowEmptyDocumentation: {
				src: 'test/disallowEmptyDocumentation',
				options: {
					disallowEmptyDocumentation: false
				}
			},
			disallowUnusedDocumentation: {
				src: 'test/disallowUnusedDocumentation',
				options: {
					disallowUnusedDocumentation: false
				}
			},
			requireCompleteMessageDocumentation: {
				src: 'test/requireCompleteMessageDocumentation',
				options: {
					requireCompleteMessageDocumentation: false
				}
			},
			requireMetadata: {
				src: 'test/requireMetadata',
				options: {
					requireMetadata: false
				}
			},
			skipIncompleteMessageDocumentation: {
				src: 'test/skipIncompleteMessageDocumentation',
				options: {
					skipIncompleteMessageDocumentation: [
						'third-message-key',
						'fourth-message-key'
					]
				}
			},
			requireInitialLowerCase: {
				src: 'test/requireLowerCase/initial',
				options: {
					requireLowerCase: 'initial'
				}
			},
			requireFullLowerCase: {
				src: 'test/requireLowerCase/full',
				options: {
					requireLowerCase: false
				}
			}
		},
		watch: {
			files: [ '<%= eslint.all %>', '.{eslintrc.json}' ],
			tasks: [ 'test' ]
		}
	} );

	grunt.registerTask( 'test', [ 'eslint', 'banana' ] );
	grunt.registerTask( 'default', 'test' );
};
