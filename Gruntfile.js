/* eslint-env node */
module.exports = function ( grunt ) {
	grunt.loadNpmTasks( 'grunt-eslint' );
	grunt.loadNpmTasks( 'grunt-contrib-watch' );
	grunt.loadTasks( './tasks/' );

	grunt.initConfig( {
		eslint: {
			all: '.'
		},
		banana: {
			testSimple: 'test/simple',
			testLessSimple: {
				src: 'test/simple',
				options: {
					sourceFile: 'en.json',
					documentationFile: 'qqq.json'
				}
			},
			testAdvanced: {
				src: 'test/advanced/{a,b}',
				options: {
					sourceFile: 'messages.json',
					documentationFile: 'documentation.json'
				}
			},
			testAllowingEmptyDocumentation: {
				src: 'test/disallowEmptyDocumentation',
				options: {
					disallowEmptyDocumentation: false
				}
			},
			testAllowingUnusedDocumentation: {
				src: 'test/disallowUnusedDocumentation',
				options: {
					disallowUnusedDocumentation: false
				}
			},
			testNotRequiringCompleteMessageDocumentation: {
				src: 'test/requireCompleteMessageDocumentation',
				options: {
					requireCompleteMessageDocumentation: false
				}
			},
			testNotRequiringMetadata: {
				src: 'test/requireMetadata',
				options: {
					requireMetadata: false
				}
			},
			testSkippingIncompleteMessageDocumentation: {
				src: 'test/skipIncompleteMessageDocumentation',
				options: {
					skipIncompleteMessageDocumentation: [
						'third-message-key',
						'fourth-message-key'
					]
				}
			},
			testAllowMixedCaseButLowerInitial: {
				src: 'test/requireLowerCase/initial',
				options: {
					requireLowerCase: 'initial'
				}
			},
			testAllowMixedCase: {
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
