/*!
 * A Grunt checker for the 'banana' format JSON i18n message files.
 */

/*jshint node:true */
module.exports = function ( grunt ) {
	grunt.registerMultiTask( 'banana', function () {
		var ok,
			path = require( 'path' ),
			options = this.options( {
				sourceFile: 'en.json',
				documentationFile: 'qqq.json'
			} ),
			messageCount = 0;

		if ( this.filesSrc.length === 0 ) {
			grunt.log.error( 'Target directory does not exist.' );
			return false;
		}

		ok = true;

		this.filesSrc.forEach( function ( dir ) {
			var sourceMessages, sourceMessageKeys,
				documentationMessages, documentationMessageKeys,
				sourceMessagesMetadataIndex, documentationMessagesMetadataIndex,
				message,
				documentationIndex,
				documentationMessageBlanks = [],
				sourceMessageMissing = [],
				count = 0;

			try {
				sourceMessages = grunt.file.readJSON( path.resolve( dir, options.sourceFile ) );
				sourceMessageKeys = Object.keys( sourceMessages );
			} catch ( e ) {
				grunt.log.error( 'Loading source messages failed: "' + e + '".' );
				ok = false;
				return;
			}

			try {
				documentationMessages = grunt.file.readJSON( path.resolve( dir, options.documentationFile ) );
				documentationMessageKeys = Object.keys( documentationMessages );
			} catch ( e ) {
				grunt.log.error( 'Loading documentation messages failed: "' + e + '".' );
				ok = false;
				return;
			}

			sourceMessagesMetadataIndex = sourceMessageKeys.indexOf( '@metadata' );
			if ( sourceMessagesMetadataIndex === -1 ) {
				grunt.log.error( 'Source file lacks a metadata block.' );
				ok = false;
				return;
			}
			sourceMessageKeys.splice( sourceMessagesMetadataIndex, 1 );
			// Count after @metadata is removed
			messageCount += sourceMessageKeys.length;

			documentationMessagesMetadataIndex = documentationMessageKeys.indexOf( '@metadata' );
			if ( documentationMessagesMetadataIndex === -1 ) {
				grunt.log.error( 'Documentation file lacks a metadata block.' );
				ok = false;
				return;
			}
			documentationMessageKeys.splice( documentationMessagesMetadataIndex, 1 );

			while ( sourceMessageKeys.length > 0 ) {
				message = sourceMessageKeys[0];
				documentationIndex = documentationMessageKeys.indexOf( message );

				if ( documentationIndex !== -1 ) {

					if ( documentationMessages[message].trim() === '' ) {
						documentationMessageBlanks.push( message );
					}

					documentationMessageKeys.splice( documentationIndex, 1 );
				} else {
					sourceMessageMissing.push( message );
				}
				sourceMessageKeys.splice( 0, 1 );
			}

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
		} );

		if ( !ok ) {
			return false;
		}

		grunt.log.ok( messageCount + ' message' + ( messageCount > 1 ? 's' : '' ) + ' checked.' );
	} );
};
