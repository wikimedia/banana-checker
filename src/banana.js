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

	// Step 1: Read config and get set up.

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

		allowLeadingWhitespace: true,
		allowTrailingWhitespace: true,

		skipIncompleteMessageDocumentation: []
	}, options );

	const jsonFilenameRegex = /(.*)\.json$/;
	const leadingWhitespaceRegex = /^\s/;
	const trailingWhitespaceRegex = /\s$/;

	const translatedData = {};

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
	const translatedFiles = fs.readdirSync( dir ).filter( ( value ) =>
		value !== options.sourceFile &&
		value !== options.documentationFile &&
		jsonFilenameRegex.test( value )
	);

	// Step 2: Walk through files and check for failures.

	translatedFiles.forEach( ( languageFile ) => {
		const language = languageFile.match( jsonFilenameRegex )[ 1 ];
		const languageMessages = messages( languageFile, language );
		const keys = keysNoMetadata( languageMessages, language );

		const blanks = [];
		const duplicates = [];
		const unuseds = [];
		const unusedParameters = [];
		let leadingWhitespace = [];
		let trailingWhitespace = [];

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
				stack = originalParameters.filter( ( originalParameter ) =>
					!languageMessages[ message ].includes( originalParameter )
				);

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

		if ( !options.allowLeadingWhitespace ) {
			leadingWhitespace = keys.filter( ( message ) =>
				leadingWhitespaceRegex.test( sourceMessages[ message ] )
			);
		}

		if ( !options.allowTrailingWhitespace ) {
			trailingWhitespace = keys.filter( ( message ) =>
				trailingWhitespaceRegex.test( sourceMessages[ message ] )
			);
		}

		if ( options.ignoreMissingBlankTranslations ) {
			missing = missing.filter( ( messageName ) =>
				sourceMessages[ messageName ] !== ''
			);
		}

		translatedData[ language ] = {
			messages: languageMessages,
			keys: keys,
			blank: blanks,
			duplicate: duplicates,
			unused: unuseds,
			missing: missing,
			unusedParameters: unusedParameters,
			leadingWhitespace: leadingWhitespace,
			trailingWhitespace: trailingWhitespace
		};
	} );

	let sourceMessageWrongCase = [];
	if ( options.requireLowerCase === 'initial' ) {
		sourceMessageWrongCase = sourceMessageKeys.filter( ( value ) =>
			( value !== '' && value[ 0 ] !== value[ 0 ].toLowerCase() )
		);
	} else if ( options.requireLowerCase ) {
		sourceMessageWrongCase = sourceMessageKeys.filter( ( value ) =>
			value !== value.toLowerCase()
		);
	}

	let sourceMessageWrongPrefix = [];
	if ( options.requireKeyPrefix.length ) {
		if ( typeof options.requireKeyPrefix === 'string' ) {
			options.requireKeyPrefix = [ options.requireKeyPrefix ];
		}
		sourceMessageWrongPrefix = sourceMessageKeys.filter( ( key ) =>
			!options.requireKeyPrefix.some( ( prefix ) =>
				key.startsWith( prefix )
			)
		);
	}

	let sourceMessageLeadingWhitespace = [];
	let documentationMessageLeadingWhitespace = [];
	if ( !options.allowLeadingWhitespace ) {
		sourceMessageLeadingWhitespace = sourceMessageKeys.filter(
			( message ) => leadingWhitespaceRegex.test( sourceMessages[ message ] )
		);

		documentationMessageLeadingWhitespace = documentationMessageKeys.filter(
			( message ) => leadingWhitespaceRegex.test( documentationMessages[ message ] )
		);
	}

	let sourceMessageTrailingWhitespace = [];
	let documentationMessageTrailingWhitespace = [];
	if ( !options.allowTrailingWhitespace ) {
		sourceMessageTrailingWhitespace = sourceMessageKeys.filter(
			( message ) => trailingWhitespaceRegex.test( sourceMessages[ message ] )
		);

		documentationMessageTrailingWhitespace = documentationMessageKeys.filter(
			( message ) => trailingWhitespaceRegex.test( documentationMessages[ message ] )
		);
	}

	let sourceMessageMissing = [];
	const documentationMessageBlanks = [];
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

	// Step 3: Go through failures and report them, based on config.

	let count = 0;
	if ( options.requireCompleteMessageDocumentation ) {
		// Filter out any missing message that is OK to be skipped
		sourceMessageMissing = sourceMessageMissing.filter( ( value ) =>
			!options.skipIncompleteMessageDocumentation.includes( value )
		);
		count = sourceMessageMissing.length;
		if ( count > 0 ) {
			ok = false;

			logErr( `${count} message${( count > 1 ? 's lack' : ' lacks' )} documentation in qqq.json.` );

			sourceMessageMissing.forEach( ( messageName ) => {
				logErr( `Message "${messageName}" lacks documentation in qqq.json.` );
			} );
		}
	}

	if ( options.disallowEmptyDocumentation ) {
		count = documentationMessageBlanks.length;
		if ( count > 0 ) {
			ok = false;

			logErr( `${count} documented message${( count > 1 ? 's are' : ' is' )} blank.` );

			documentationMessageBlanks.forEach( ( messageName ) => {
				logErr( `Message "${messageName}" is documented with a blank string.` );
			} );
		}
	}

	if ( options.requireLowerCase ) {
		count = sourceMessageWrongCase.length;
		if ( count > 0 ) {
			ok = false;

			if ( options.requireLowerCase === 'initial' ) {
				logErr( `${count} message${( count > 1 ? 's do' : ' does' )} not start with a lowercase character.` );

				sourceMessageWrongCase.forEach( ( messageName ) => {
					logErr( `Message "${messageName}" should start with a lowercase character.` );
				} );
			} else {
				logErr( `${count} message${( count > 1 ? 's are' : ' is' )} not wholly lowercase.` );

				sourceMessageWrongCase.forEach( ( messageName ) => {
					logErr( `Message "${messageName}" should be in lowercase.` );
				} );
			}
		}
	}

	if ( options.requireKeyPrefix.length ) {
		count = sourceMessageWrongPrefix.length;
		if ( count > 0 ) {
			ok = false;

			if ( options.requireKeyPrefix.length === 1 ) {
				logErr( `${count} message${( count > 1 ? 's do' : ' does' )} not start with the required prefix "${options.requireKeyPrefix[ 0 ]}".` );

				sourceMessageWrongPrefix.forEach( ( messageName ) => {
					logErr( `Message "${messageName}" should start with the required prefix "${options.requireKeyPrefix[ 0 ]}".` );
				} );
			} else {
				logErr( `${count} message${( count > 1 ? 's do' : ' does' )} not start with any of the required prefices.'` );

				sourceMessageWrongPrefix.forEach( ( messageName ) => {
					logErr( `Message "${messageName}" should start with one of the required prefices.` );
				} );
			}
		}
	}

	if ( options.disallowUnusedDocumentation ) {
		count = documentationMessageKeys.length;
		if ( count > 0 ) {
			ok = false;

			logErr( `${count} documented message${( count > 1 ? 's are' : ' is' )} undefined.` );

			documentationMessageKeys.forEach( ( messageName ) => {
				logErr( `Message "${messageName}" is documented but undefined.` );
			} );
		}
	}

	if ( !options.allowLeadingWhitespace ) {
		count = sourceMessageLeadingWhitespace.length;
		if ( count > 0 ) {
			ok = false;
			logErr( `${count} message${( count > 1 ? 's have' : ' has' )} leading whitespace:` );
			sourceMessageLeadingWhitespace.forEach( ( message ) => {
				logErr( `Message "${message}" has leading whitespace` );
			} );
		}

		count = documentationMessageLeadingWhitespace.length;
		if ( count > 0 ) {
			ok = false;
			logErr( `${count} message documentation${( count > 1 ? 's have' : ' has' )} leading whitespace:` );
			documentationMessageLeadingWhitespace.forEach( ( message ) => {
				logErr( `Message documentation "${message}" has leading whitespace` );
			} );
		}
	}

	if ( !options.allowTrailingWhitespace ) {
		count = sourceMessageTrailingWhitespace.length;
		if ( count > 0 ) {
			ok = false;
			logErr( `${count} message${( count > 1 ? 's have' : ' has' )} trailing whitespace:` );
			sourceMessageTrailingWhitespace.forEach( ( message ) => {
				logErr( `Message "${message}" has trailing whitespace` );
			} );
		}

		count = documentationMessageTrailingWhitespace.length;
		if ( count > 0 ) {
			ok = false;
			logErr( `${count} message documentation${( count > 1 ? 's have' : ' has' )} trailing whitespace:` );
			documentationMessageTrailingWhitespace.forEach( ( message ) => {
				logErr( `Message documentation "${message}" has trailing whitespace` );
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
				translatedData[ index ].blank.forEach( ( messageName ) => {
					logErr( `The translation of "${messageName}" is blank.` );
				} );
			}
		}

		if ( options.disallowDuplicateTranslations ) {
			count = translatedData[ index ].duplicate.length;
			if ( count > 0 ) {
				ok = false;
				logErr( `The "${index}" translation has ${count} duplicate translation${( count > 1 ? 's' : '' )}:` );
				translatedData[ index ].duplicate.forEach( ( messageName ) => {
					logErr( `The translation of "${messageName}" duplicates the primary message.` );
				} );
			}
		}

		if ( options.disallowUnusedTranslations ) {
			count = translatedData[ index ].unused.length;
			if ( count > 0 ) {
				ok = false;
				logErr( `The "${index}" translation has ${count} unused translation${( count > 1 ? 's' : '' )}:` );
				translatedData[ index ].unused.forEach( ( messageName ) => {
					logErr( `The translation of "${messageName}" is unused.` );
				} );
			}
		}

		if ( options.requireCompletelyUsedParameters ) {
			count = translatedData[ index ].unusedParameters.length;
			if ( count > 0 ) {
				ok = false;
				logErr( `The "${index}" translation has ${count} message${( count > 1 ? 's' : '' )} which fail${( count > 1 ? 's' : '' )} to use all parameters:` );

				translatedData[ index ].unusedParameters.forEach( ( report ) => {
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

		if ( !options.allowLeadingWhitespace ) {
			count = translatedData[ index ].leadingWhitespace.length;
			if ( count > 0 ) {
				ok = false;
				logErr( `The "${index}" translation has ${count} translation${( count > 1 ? 's' : '' )} with leading whitespace:` );
				translatedData[ index ].leadingWhitespace.forEach( ( message ) => {
					logErr( `The translation of "${message}" has leading whitespace.` );
				} );
			}
		}

		if ( !options.allowTrailingWhitespace ) {
			count = translatedData[ index ].trailingWhitespace.length;
			if ( count > 0 ) {
				ok = false;
				logErr( `The "${index}" translation has ${count} translation${( count > 1 ? 's' : '' )} with trailing whitespace:` );
				translatedData[ index ].trailingWhitespace.forEach( ( message ) => {
					logErr( `The translation of "${message}" has trailing whitespace.` );
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

				translatedData[ index ].missing.forEach( ( messageName ) => {
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

				translatedData[ index ].missing.forEach( ( messageName ) => {
					logErr( `The required message "${messageName}" is missing.` );
				} );
			}
		}

	}

	return ok;
};
