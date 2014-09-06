/*!
 * A grunt checker for the 'banana' format JSON i18n message files.
 */

/*jshint node:true */
module.exports = function ( grunt ) {
	grunt.registerMultiTask( 'banana', function () {
		var path = require( 'path' ),
			options = this.options( {
				sourceFile: 'en.json',
				documentationFile: 'qqq.json'
			} ),
			messageCount = 0,
			sourceMetaDatablocks = 0,
			documentationMetaDatablocks = 0,
			failureFlags = { noSourceMetadata: [], noDocumentationMetadata: [] },
			totalErrors = 0;

		this.filesSrc.forEach( function ( dir ) {
			var documentationMessagesMetadataIndex,
				sourceMessagesMetadataIndex,
				message,
				documentationIndex,
				documentationMessages = grunt.file.readJSON( path.resolve( dir, options.documentationFile ) ),
				documentationMessageKeys = Object.keys( documentationMessages ),
				documentationMessageBlanks = [],
				sourceMessages = grunt.file.readJSON( path.resolve( dir, options.sourceFile ) ),
				sourceMessageKeys = Object.keys( sourceMessages ),
				sourceIndex = 0,
				count = 0;

			messageCount += sourceMessageKeys.length;

			sourceMessagesMetadataIndex = sourceMessageKeys.indexOf( '@metadata' );
			if ( sourceMessagesMetadataIndex === -1 ) {
				failureFlags.noSourceMetadata.push( dir );
			} else {
				documentationMetaDatablocks++;
			}
			sourceMessageKeys.splice( sourceMessagesMetadataIndex, 1 );

			documentationMessagesMetadataIndex = documentationMessageKeys.indexOf( '@metadata' );
			if ( documentationMessagesMetadataIndex === -1 ) {
				failureFlags.noDocumentationMetadata.push( dir );
			} else {
				sourceMetaDatablocks++;
			}
			documentationMessageKeys.splice( documentationMessagesMetadataIndex, 1 );

			while (sourceMessageKeys.length > 0) {
				message = sourceMessageKeys[0];
				documentationIndex = documentationMessageKeys.indexOf( message );

				if ( documentationIndex !== -1 ) {

					if ( documentationMessages[message].trim() === '' ) {
						documentationMessageBlanks.push( message );
					}

					documentationMessageKeys.splice( documentationIndex, 1 );
				}
				sourceMessageKeys.splice( sourceIndex, 1 );
			}

			grunt.verbose.subhead( 'Checking message source files for metadata block' );
			count = failureFlags.noSourceMetadata.length;
			totalErrors += count;
			if ( count > 0 ) {
				grunt.log.error(
					count + ' message source file' + ( count > 1 ? 's lack' : ' lacks' ) + ' a metadata block:'
				);

				failureFlags.noSourceMetadata.forEach( function ( dir ) {
					grunt.log.error( 'Message source file "' + dir + '" lacks a metadata block.' );
				} );
			}

			grunt.verbose.subhead( 'Checking message documentation files for metadata block' );
			count = failureFlags.noDocumentationMetadata.length;
			totalErrors += count;
			if ( count > 0 ) {
				grunt.log.error(
					count + ' message documentation file' + ( count > 1 ? 's lack' : ' lacks' ) + ' a metadata block:'
				);

				failureFlags.noDocumentationMetadata.forEach( function ( dir ) {
					grunt.log.error( 'Message documentation file "' + dir + '" lacks a metadata block.' );
				} );
			}

			grunt.verbose.subhead( 'Checking messages for missing documentation' );

			failureFlags.undocumentedMessages = sourceMessageKeys.slice( 0 );

			count = failureFlags.undocumentedMessages.length;
			totalErrors += count;
			if ( count > 0 ) {
				grunt.log.error(
					count + ' message' + ( count > 1 ? 's lack' : ' lacks' ) + ' documentation:'
				);

				failureFlags.undocumentedMessages.forEach( function ( message ) {
					grunt.log.error( 'Message "' + message + '" lacks documentation.' );
				} );
			}

			grunt.verbose.subhead( 'Checking messages for blank documentation' );

			failureFlags.blanklyDefinedMessages = documentationMessageBlanks.slice( 0 );

			count = failureFlags.blanklyDefinedMessages.length;
			totalErrors += count;
			if ( count > 0 ) {
				grunt.log.error(
					count + ' documented message' + ( count > 1 ? 's are' : ' is' ) + ' blank:'
				);

				failureFlags.blanklyDefinedMessages.forEach( function ( message ) {
					grunt.log.error( 'Message "' + message + '" is documented with a blank string.' );
				} );
			}

			grunt.verbose.subhead( 'Checking documentation for undefined messages' );

			failureFlags.undefinedMessages = documentationMessageKeys.slice( 0 );

			count = failureFlags.undefinedMessages.length;
			totalErrors += count;
			if ( count > 0 ) {
				grunt.log.error(
					count + ' documented message' + ( count > 1 ? 's are' : ' is' ) + ' undefined:'
				);

				failureFlags.undefinedMessages.forEach( function ( message ) {
					grunt.log.error( 'Message "' + message + '" is documented but undefined.' );
				} );
			}
		} );

		grunt.verbose.subhead( 'Summary' );

		if ( totalErrors ) {
			grunt.log.error( 'In total, ' + totalErrors + ' errors.' );

			return false;
		}

		grunt.log.ok( messageCount + ' message' + ( messageCount > 1 ? 's' : '') + ' checked.' );
	} );
};
