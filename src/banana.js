'use strict';

const path = require( 'path' );
const fs = require( 'fs' );

/**
 * Checker for the 'Banana' JSON-file format for interface messages.
 *
 * @param {string} dir
 * @param {Object} options
 * @param {Function} logErr Callback accepting an error message
 *  as first string parameter.
 * @return {boolean} Success
 */
module.exports = function bananaChecker( dir, options, logErr ) {
	let ok = true;

	options = Object.assign( {
		sourceFile: 'en.json',
		documentationFile: 'qqq.json',

		disallowBlankTranslations: true,
		disallowDuplicateTranslations: false,
		disallowUnusedDocumentation: true,
		disallowUnusedTranslations: false,
		ignoreMissingBlankTranslations: true,

		requireCompleteMessageDocumentation: true,
		requireCompleteTranslationLanguages: [],
		requireCompleteTranslationMessages: [],
		requireKeyPrefix: [],
		requireLowerCase: true,
		requireMetadata: true,

		skipIncompleteMessageDocumentation: []
	}, options );

	const jsonFilenameRegex = /(.*)\.json$/;
	const translatedData = {};
	const documentationMessageBlanks = [];
	let sourceMessageMissing = [];
	let sourceMessageWrongCase = [];
	let sourceMessageWrongPrefix = [];
	let count = 0;

	function messages( filename, type ) {
		let messageArray;

		try {
			messageArray = require( path.resolve( dir, filename ) );
		} catch ( e ) {
			logErr( `Loading ${type} messages failed: "${e}".` );
			ok = false;
			throw e;
		}

		return messageArray;
	}

	function keysNoMetadata( messageArray, type ) {
		const keys = Object.keys( messageArray );

		const keyOffset = keys.indexOf( '@metadata' );

		if ( keyOffset === -1 ) {
			if ( options.requireMetadata ) {
				logErr( `No metadata block in the ${type} messages file.` );
				ok = false;
			}
		} else {
			keys.splice( keyOffset, 1 );
		}

		return keys;
	}

	// Source message data
	const sourceMessages = messages( options.sourceFile, 'source' );
	const sourceMessageKeys = keysNoMetadata( sourceMessages, 'source' );

	// Documentation message data
	const documentationMessages = messages( options.documentationFile, 'documentation' );
	const documentationMessageKeys = keysNoMetadata( documentationMessages, 'documentation' );

	// Translated message data
	const translatedFiles = fs.readdirSync( dir ).filter( function ( value ) {
		return (
			value !== options.sourceFile &&
			value !== options.documentationFile &&
			jsonFilenameRegex.test( value )
		);
	} );

	translatedFiles.forEach( function ( languageFile ) {
		const language = languageFile.match( jsonFilenameRegex )[ 1 ];
		const languageMessages = messages( languageFile, language );
		const keys = keysNoMetadata( languageMessages, language );

		const blanks = [];
		const duplicates = [];
		const unuseds = [];
		const unusedParameters = [];

		let missing = sourceMessageKeys.slice( 0 );
		let stack, originalParameters;

		for ( const index in keys ) {
			const message = keys[ index ];
			if ( sourceMessages[ message ] === undefined ) {
				// An unused translation. This happens on commits that remove messages,
				// which are typically removed from en.json and qqq.json, letting
				// translations be removed by a localisation update instead.
				originalParameters = null;
			} else {
				originalParameters = sourceMessages[ message ].match( /\$\d/g );
			}

			if ( missing.includes( message ) ) {
				if ( languageMessages[ message ] === sourceMessages[ message ] ) {
					duplicates.push( message );
				}
				missing.splice( missing.indexOf( message ), 1 );
			} else {
				unuseds.push( message );
			}

			if ( originalParameters ) {
				stack = originalParameters.filter( function ( originalParameter ) {
					return !languageMessages[ message ].includes( originalParameter );
				} );

				if ( stack.length ) {
					unusedParameters.push( { message, stack } );
				}
			}

			if ( typeof languageMessages[ message ] !== 'string' ) {
				continue;
			}
			if ( languageMessages[ message ].trim() === '' ) {
				blanks.push( message );
			}
		}

		if ( options.ignoreMissingBlankTranslations ) {
			missing = missing.filter( function ( messageName ) {
				return sourceMessages[ messageName ] !== '';
			} );
		}

		translatedData[ language ] = {
			messages: languageMessages,
			keys: keys,
			blank: blanks,
			duplicate: duplicates,
			unused: unuseds,
			missing: missing,
			unusedParameters: unusedParameters
		};
	} );

	if ( options.requireLowerCase === 'initial' ) {
		sourceMessageWrongCase = sourceMessageKeys.filter( function ( value ) {
			return ( value !== '' && value[ 0 ] !== value[ 0 ].toLowerCase() );
		} );
	} else if ( options.requireLowerCase ) {
		sourceMessageWrongCase = sourceMessageKeys.filter( function ( value ) {
			return value !== value.toLowerCase();
		} );
	}

	if ( options.requireKeyPrefix.length ) {
		if ( typeof options.requireKeyPrefix === 'string' ) {
			options.requireKeyPrefix = [ options.requireKeyPrefix ];
		}
		sourceMessageWrongPrefix = sourceMessageKeys.filter( function ( key ) {
			return !options.requireKeyPrefix.some( function ( prefix ) {
				return key.startsWith( prefix );
			} );
		} );
	}

	while ( sourceMessageKeys.length > 0 ) {
		const message = sourceMessageKeys[ 0 ];

		const offset = documentationMessageKeys.indexOf( message );

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
			return !options.skipIncompleteMessageDocumentation.includes( value );
		} );
		count = sourceMessageMissing.length;
		if ( count > 0 ) {
			ok = false;

			logErr( `${count} message${( count > 1 ? 's lack' : ' lacks' )} documentation in qqq.json.` );

			sourceMessageMissing.forEach( function ( messageName ) {
				logErr( `Message "${messageName}" lacks documentation in qqq.json.` );
			} );
		}
	}

	if ( options.disallowEmptyDocumentation ) {
		count = documentationMessageBlanks.length;
		if ( count > 0 ) {
			ok = false;

			logErr( `${count} documented message${( count > 1 ? 's are' : ' is' )} blank.` );

			documentationMessageBlanks.forEach( function ( messageName ) {
				logErr( `Message "${messageName}" is documented with a blank string.` );
			} );
		}
	}

	count = sourceMessageWrongCase.length;
	if ( count > 0 ) {
		ok = false;

		if ( options.requireLowerCase === 'initial' ) {
			logErr( `${count} message${( count > 1 ? 's do' : ' does' )} not start with a lowercase character.` );

			sourceMessageWrongCase.forEach( function ( messageName ) {
				logErr( `Message "${messageName}" should start with a lowercase character.` );
			} );
		} else {
			logErr( `${count} message${( count > 1 ? 's are' : ' is' )} not wholly lowercase.` );

			sourceMessageWrongCase.forEach( function ( messageName ) {
				logErr( `Message "${messageName}" should be in lowercase.` );
			} );
		}
	}

	count = sourceMessageWrongPrefix.length;
	if ( count > 0 ) {
		ok = false;

		if ( options.requireKeyPrefix.length === 1 ) {
			logErr( `${count} message${( count > 1 ? 's do' : ' does' )} not start with the required prefix "${options.requireKeyPrefix[ 0 ]}".` );

			sourceMessageWrongPrefix.forEach( function ( messageName ) {
				logErr( `Message "${messageName}" should start with the required prefix "${options.requireKeyPrefix[ 0 ]}".` );
			} );
		} else {
			logErr( `${count} message${( count > 1 ? 's do' : ' does' )} not start with any of the required prefices.'` );

			sourceMessageWrongPrefix.forEach( function ( messageName ) {
				logErr( `Message "${messageName}" should start with one of the required prefices.` );
			} );
		}
	}

	if ( options.disallowUnusedDocumentation ) {
		count = documentationMessageKeys.length;
		if ( count > 0 ) {
			ok = false;

			logErr( `${count} documented message${( count > 1 ? 's are' : ' is' )} undefined.` );

			documentationMessageKeys.forEach( function ( messageName ) {
				logErr( `Message "${messageName}" is documented but undefined.` );
			} );
		}
	}

	for ( const index in translatedData ) {
		// eslint-disable-next-line no-prototype-builtins
		if ( !translatedData.hasOwnProperty( index ) ) {
			continue;
		}

		if ( options.disallowBlankTranslations ) {
			count = translatedData[ index ].blank.length;
			if ( count > 0 ) {
				ok = false;
				logErr( `The "${index}" translation has ${count} blank translation${( count > 1 ? 's' : '' )}:` );
				translatedData[ index ].blank.forEach( function ( messageName ) {
					logErr( `The translation of "${messageName}" is blank.` );
				} );
			}
		}

		if ( options.disallowDuplicateTranslations ) {
			count = translatedData[ index ].duplicate.length;
			if ( count > 0 ) {
				ok = false;
				logErr( `The "${index}" translation has ${count} duplicate translation${( count > 1 ? 's' : '' )}:` );
				translatedData[ index ].duplicate.forEach( function ( messageName ) {
					logErr( `The translation of "${messageName}" duplicates the primary message.` );
				} );
			}
		}

		if ( options.disallowUnusedTranslations ) {
			count = translatedData[ index ].unused.length;
			if ( count > 0 ) {
				ok = false;
				logErr( `The "${index}" translation has ${count} unused translation${( count > 1 ? 's' : '' )}:` );
				translatedData[ index ].unused.forEach( function ( messageName ) {
					logErr( `The translation of "${messageName}" is unused.` );
				} );
			}
		}

		if ( options.requireCompletelyUsedParameters ) {
			count = translatedData[ index ].unusedParameters.length;
			if ( count > 0 ) {
				ok = false;
				logErr( `The "${index}" translation has ${count} message${( count > 1 ? 's' : '' )} which fail${( count > 1 ? 's' : '' )} to use all parameters:` );

				translatedData[ index ].unusedParameters.forEach( function ( report ) {
					switch ( report.stack.length ) {
						case 1:
							logErr( `The translation of "${report.message}" fails to use the parameter "${report.stack[ 0 ]}".` );
							break;
						case 2:
							logErr( `The translation of "${report.message}" fails to use the parameters "${report.stack[ 0 ]}" and "${report.stack[ 1 ]}" .` );
							break;
						default:
							logErr( `The translation of "${report.message}" fails to use the parameters "${report.stack.join( '", "' )}".` );
					}
				} );
			}
		}
	}

	if ( options.requireCompleteTranslationLanguages.length ) {
		for ( const index in translatedData ) {
			if (
				// eslint-disable-next-line no-prototype-builtins
				!translatedData.hasOwnProperty( index ) ||
				( !options.requireCompleteTranslationLanguages.includes( index ) )
			) {
				continue;
			}

			count = translatedData[ index ].missing.length;
			if ( count > 0 ) {
				ok = false;
				logErr( `The "${index}" translation has ${count} missing translation${( count > 1 ? 's' : '' )}:` );

				translatedData[ index ].missing.forEach( function ( messageName ) {
					logErr( `The translation of "${messageName}" is missing.` );
				} );
			}
		}
	}

	if ( options.requireCompleteTranslationMessages.length ) {
		for ( const index in translatedData ) {
			// eslint-disable-next-line no-prototype-builtins
			if ( !translatedData.hasOwnProperty( index ) ) {
				continue;
			}

			for ( const message in translatedData[ index ].missing ) {
				if (
					// eslint-disable-next-line no-prototype-builtins
					!translatedData[ index ].missing.hasOwnProperty( sourceMessageKeys[ message ] )
				) {
					continue;
				}

				const offset = options.requireCompleteTranslationMessages.indexOf(
					sourceMessageKeys[ message ]
				);

				if ( offset === -1 ) {
					translatedData[ index ].missing.splice( offset, 1 );
				}
			}

			count = translatedData[ index ].missing.length;
			if ( count > 0 ) {
				ok = false;
				logErr( `The "${index}" translation is missing ${count} required message{( count > 1 ? 's' : '' )}:` );

				translatedData[ index ].missing.forEach( function ( messageName ) {
					logErr( `The required message "${messageName}" is missing.` );
				} );
			}
		}

	}

	return ok;
};
