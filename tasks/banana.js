/*!
 * A Grunt checker for the 'banana' format JSON i18n message files.
 */

var bananaChecker = require( '../src/banana.js' );

/* eslint-env node */
module.exports = function ( grunt ) {
	grunt.registerMultiTask( 'banana', function () {
		var ok,
			options = this.options(),
			messageDirs = 0;

		if ( this.filesSrc.length === 0 ) {
			grunt.log.error( 'Target directory does not exist.' );
			return false;
		}

		ok = true;

		this.filesSrc.forEach( function ( dir ) {
			ok = bananaChecker(
				dir,
				options,
				grunt.log.error
			) && ok;

			messageDirs++;
		} );

		if ( !ok ) {
			return false;
		}

		grunt.log.ok( messageDirs + ' message ' + ( messageDirs > 1 ? 'directories' : 'directory' ) + ' checked.' );
	} );
};
