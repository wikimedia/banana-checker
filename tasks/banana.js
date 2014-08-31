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
			ok = true;

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
				grunt.log.error( 'Source file lacks a metadata block.' );
				ok = false;
				return;
			}
			sourceMessageKeys.splice( sourceMessagesMetadataIndex, 1 );

			documentationMessagesMetadataIndex = documentationMessageKeys.indexOf( '@metadata' );
			if ( documentationMessagesMetadataIndex === -1 ) {
				grunt.log.error( 'Documentation file lacks a metadata block.' );
				ok = false;
				return;
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

			count = sourceMessageKeys.length;
			if ( count > 0 ) {
				ok = false;

				grunt.log.error(
					count + ' message' + ( count > 1 ? 's lack' : ' lacks' ) + ' documentation.'
				);

				sourceMessageKeys.forEach( function ( message ) {
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

		grunt.log.ok( messageCount + ' message' + ( messageCount > 1 ? 's' : '') + ' checked.' );
	} );
};
