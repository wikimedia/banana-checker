/*!
 * A Grunt checker for the 'banana' format JSON i18n message files.
 */

/*jshint node:true */
module.exports = function ( grunt ) {
	grunt.registerMultiTask( 'banana', function () {
		var ok,
			path = require( 'path' ),
			fs = require( 'fs' ),
			options = this.options( {
				sourceFile: 'en.json',
				documentationFile: 'qqq.json',

				requireMetadata: true,

				requireCompleteMessageDocumentation: true,
				disallowUnusedDocumentation: true,

				disallowBlankTranslations: true,
				disallowDuplicateTranslations: false,
				disallowUnusedTranslations: false,

				requireCompleteTranslationLanguages: [],
				requireCompleteTranslationMessages: [],

				skipIncompleteMessageDocumentation: []
			} ),
			messageCount = 0;

		if ( this.filesSrc.length === 0 ) {
			grunt.log.error( 'Target directory does not exist.' );
			return false;
		}

		ok = true;

		this.filesSrc.forEach( function ( dir ) {
			var message, index, offset,
				// Source message data
				sourceMessages, sourceMessageKeys,
				// Documentation message data
				documentationMessages, documentationMessageKeys,
				// Translated message data
				translatedFiles,
				jsonFilenameRegex = /(.*)\.json$/,
				translatedData = {},
				documentationMessageBlanks = [],
				sourceMessageMissing = [],
				count = 0;

			function messages( filename, type ) {
				var messageArray;

				try {
					messageArray = grunt.file.readJSON( path.resolve( dir, filename ) );
				} catch ( e ) {
					grunt.log.error( 'Loading ' + type + ' messages failed: "' + e + '".' );
					ok = false;
					throw e;
				}

				return messageArray;
			}
			function keysNoMetadata( messageArray, type ) {
				var keys, offset;

				try {
					keys = Object.keys( messageArray );
				} catch ( e ) {
					grunt.log.error( 'Loading ' + type + ' messages failed: "' + e + '".' );
					ok = false;
					throw e;
				}

				offset = keys.indexOf( '@metadata' );
				if ( offset === -1 ) {
					if ( options.requireMetadata ) {
						grunt.log.error( 'No metadata block in the ' + type + ' messages file.' );
						ok = false;
					}
				} else {
					keys.splice( offset, 1 );
				}

				return keys;
			}
			sourceMessages = messages( options.sourceFile, 'source' );
			sourceMessageKeys = keysNoMetadata( sourceMessages, 'source' );

			documentationMessages = messages( options.documentationFile, 'documentation' );
			documentationMessageKeys = keysNoMetadata( documentationMessages, 'documentation' );

			// Count after @metadata is removed
			messageCount += sourceMessageKeys.length;

			translatedFiles = fs.readdirSync( dir ).filter( function ( value ) {
				return (
					value !== options.sourceFile &&
					value !== options.documentationFile &&
					value.match( jsonFilenameRegex )
				);
			} );

			translatedFiles.forEach( function ( languageFile ) {
				var language = languageFile.match( jsonFilenameRegex )[ 1 ],
					languageMesages = messages( languageFile, language ),
					keys = keysNoMetadata( languageMesages, language ),
					blanks = [],
					duplicates = [],
					unuseds = [],
					missing = sourceMessageKeys.slice( 0 );

				for ( index in keys ) {
					message = keys[ index ];

					if ( missing.indexOf( message ) !== -1 ) {
						if ( languageMesages[ message ] === sourceMessages[ message ] ) {
							duplicates.push( message );
						}
						missing.splice( missing.indexOf( message ), 1 );
					} else {
						unuseds.push( message );
					}

					if ( typeof languageMesages[ message ] !== 'string' ) {
						continue;
					}
					if ( languageMesages[ message ].trim() === '' ) {
						blanks.push( message );
					}
				}

				translatedData[ language ] = {
					messages: languageMesages,
					keys: keys,
					blank: blanks,
					duplicate: duplicates,
					unused: unuseds,
					missing: missing
				};
			} );

			while ( sourceMessageKeys.length > 0 ) {
				message = sourceMessageKeys[ 0 ];

				offset = documentationMessageKeys.indexOf( message );

				if ( offset !== -1 ) {

					if ( documentationMessages[ message ].trim() === '' ) {
						documentationMessageBlanks.push( message );
					}

					documentationMessageKeys.splice( offset, 1 );
				} else {
					sourceMessageMissing.push( message );
				}
				sourceMessageKeys.splice( 0, 1 );
			}

			if ( options.requireCompleteMessageDocumentation ) {
				// Filter out any missing message that is OK to be skipped
				sourceMessageMissing = sourceMessageMissing.filter( function ( value ) {
					return options.skipIncompleteMessageDocumentation.indexOf( value ) === -1;
				} );
				count = sourceMessageMissing.length;
				if ( count > 0 ) {
					ok = false;

					grunt.log.error(
						count + ' message' + ( count > 1 ? 's lack' : ' lacks' ) + ' documentation.'
					);

					sourceMessageMissing.forEach( function ( message ) {
						grunt.log.error( 'Message "' + message + '" lacks documentation.' );
					} );
				}
			}

			if ( options.disallowEmptyDocumentation ) {
				count = documentationMessageBlanks.length;
				if ( count > 0 ) {
					ok = false;

					grunt.log.error(
						count + ' documented message' + ( count > 1 ? 's are' : ' is' ) + ' blank.'
					);

					documentationMessageBlanks.forEach( function ( message ) {
						grunt.log.error( 'Message "' + message + '" is documented with a blank string.' );
					} );
				}
			}

			if ( options.disallowUnusedDocumentation ) {
				count = documentationMessageKeys.length;
				if ( count > 0 ) {
					ok = false;

					grunt.log.error(
						count + ' documented message' + ( count > 1 ? 's are' : ' is' ) + ' undefined.'
					);

					documentationMessageKeys.forEach( function ( message ) {
						grunt.log.error( 'Message "' + message + '" is documented but undefined.' );
					} );
				}
			}

			for ( index in translatedData ) {
				if ( !translatedData.hasOwnProperty( index ) ) {
					continue;
				}

				if ( options.disallowBlankTranslations ) {
					count = translatedData[ index ].blank.length;
					if ( count > 0 ) {
						ok = false;
						grunt.log.error( 'The "' + index + '" translation has ' + count + ' blank translation' + ( count > 1 ? 's' : '' ) + ':' );

						// jshint -W083
						translatedData[ index ].blank.forEach( function ( message ) {
							grunt.log.error( 'The translation of "' + message + '" is blank.' );
						} );
						// jshint +W083
					}
				}

				if ( options.disallowDuplicateTranslations ) {
					count = translatedData[ index ].duplicate.length;
					if ( count > 0 ) {
						ok = false;
						grunt.log.error( 'The "' + index + '" translation has ' + count + ' duplicate translation' + ( count > 1 ? 's' : '' ) + ':' );

						// jshint -W083
						translatedData[ index ].duplicate.forEach( function ( message ) {
							grunt.log.error( 'The translation of "' + message + '" is a duplicate of the primary message.' );
						} );
						// jshint +W083
					}
				}

				if ( options.disallowUnusedTranslations ) {
					count = translatedData[ index ].unused.length;
					if ( count > 0 ) {
						ok = false;
						grunt.log.error( 'The "' + index + '" translation has ' + count + ' unused translation' + ( count > 1 ? 's' : '' ) + ':' );

						// jshint -W083
						translatedData[ index ].unused.forEach( function ( message ) {
							grunt.log.error( 'The translation of "' + message + '" is unused.' );
						} );
						// jshint +W083
					}
				}

			}

			if ( options.requireCompleteTranslationLanguages.length ) {
				for ( index in translatedData ) {
					if (
						!translatedData.hasOwnProperty( index ) ||
						( options.requireCompleteTranslationLanguages.indexOf( index ) === -1 )
					) {
						continue;
					}

					count = translatedData[ index ].missing.length;
					if ( count > 0 ) {
						ok = false;
						grunt.log.error( 'The "' + index + '" translation has ' + count + ' missing translation' + ( count > 1 ? 's' : '' ) + ':' );

						// jshint -W083
						translatedData[ index ].missing.forEach( function ( message ) {
							grunt.log.error( 'The translation of "' + message + '" is missing.' );
						} );
						// jshint +W083
					}
				}
			}

			if ( options.requireCompleteTranslationMessages.length ) {
				for ( index in translatedData ) {
					if ( !translatedData.hasOwnProperty( index ) ) {
						continue;
					}

					for ( message in translatedData[ index ].missing ) {
						if ( !translatedData[ index ].missing.hasOwnProperty( sourceMessageKeys[ message ] ) ) {
							continue;
						}

						offset = options.requireCompleteTranslationMessages.indexOf( sourceMessageKeys[ message ] );

						if ( offset === -1 ) {
							translatedData[ index ].missing.splice( offset, 1 );
						}
					}

					count = translatedData[ index ].missing.length;
					if ( count > 0 ) {
						ok = false;
						grunt.log.error( 'The "' + index + '" translation is missing ' + count + ' required message' + ( count > 1 ? 's' : '' ) + ':' );

						// jshint -W083
						translatedData[ index ].missing.forEach( function ( message ) {
							grunt.log.error( 'The required message "' + message + '" is missing.' );
						} );
						// jshint +W083
					}
				}

			}

		} );

		if ( !ok ) {
			return false;
		}

		grunt.log.ok( messageCount + ' message' + ( messageCount > 1 ? 's' : '' ) + ' checked.' );
	} );
};
