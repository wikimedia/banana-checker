'use strict';

const assert = require( 'assert' );
const bananaChecker = require( '../src/banana.js' );
const PASS = true;
const FAIL = false;

console.log( 'test: simple' );
{
	const result = bananaChecker(
		'test/simple',
		{},
		function () {}
	);
	assert.strictEqual( result, PASS );
}

console.log( 'test: declare files explicitly' );
{
	const result = bananaChecker(
		'test/simple',
		{
			sourceFile: 'en.json',
			documentationFile: 'qqq.json'
		},
		function () {}
	);
	assert.strictEqual( result, PASS );
}

console.log( 'test: custom file names' );
{
	const result = bananaChecker(
		'test/advanced/a',
		{
			sourceFile: 'messages.json',
			documentationFile: 'documentation.json'
		},
		function () {}
	);
	assert.strictEqual( result, PASS );
}

console.log( 'test: files not found' );
{
	assert.throws(
		() => {
			bananaChecker(
				'test/simple',
				{
					sourceFile: 'messages.json',
					documentationFile: 'documentation.json'
				},
				function () {}
			);
		},
		/Cannot find/
	);
}

console.log( 'test: disallowEmptyDocumentation' );
{
	const errs = [],
		result = bananaChecker(
			'test/disallowEmptyDocumentation',
			{
				disallowEmptyDocumentation: true
			},
			function ( err ) { errs.push( err ); }
		);
	assert.strictEqual( result, FAIL );
	assert.deepStrictEqual( errs, [
		'1 documented message is blank.',
		'Message "second-message-key" is documented with a blank string.'
	] );
}

console.log( 'test: disallowEmptyDocumentation (disabled)' );
{
	const result = bananaChecker(
		'test/disallowEmptyDocumentation',
		{
			disallowEmptyDocumentation: false
		},
		function () {}
	);
	assert.strictEqual( result, PASS );
}

console.log( 'test: disallowUnusedDocumentation' );
{
	const errs = [],
		result = bananaChecker(
			'test/disallowUnusedDocumentation',
			{
				disallowUnusedDocumentation: true
			},
			function ( err ) { errs.push( err ); }
		);
	assert.strictEqual( result, FAIL );
	assert.deepStrictEqual( errs, [
		'1 documented message is undefined.',
		'Message "five-message-key" is documented but undefined.'
	] );
}

console.log( 'test: disallowUnusedDocumentation (disabled)' );
{
	const result = bananaChecker(
		'test/disallowUnusedDocumentation',
		{
			disallowUnusedDocumentation: false
		},
		function () {}
	);
	assert.strictEqual( result, PASS );
}

console.log( 'test: requireCompletelyUsedParameters' );
{
	const errs = [],
		result = bananaChecker(
			'test/requireCompletelyUsedParameters',
			{
				requireCompletelyUsedParameters: true
			},
			function ( err ) { errs.push( err ); }
		);

	assert.strictEqual( result, FAIL );
	assert.deepStrictEqual( errs, [
		'The "de" translation has 1 message which fail to use all parameters:',
		'The translation of "second-message-key" fails to use the parameters "$2" and "$1" .',
		'The "fr" translation has 3 messages which fails to use all parameters:',
		'The translation of "first-message-key" fails to use the parameter "$2".',
		'The translation of "second-message-key" fails to use the parameter "$1".',
		'The translation of "third-message-key" fails to use the parameters "$2", "$3", "$4".'
	] );
}

console.log( 'test: requireCompleteMessageDocumentation' );
{
	const errs = [],
		result = bananaChecker(
			'test/requireCompleteMessageDocumentation',
			{
				requireCompleteMessageDocumentation: true
			},
			function ( err ) { errs.push( err ); }
		);
	assert.strictEqual( result, FAIL );
	assert.deepStrictEqual( errs, [
		'1 message lacks documentation in qqq.json.',
		'Message "third-message-key" lacks documentation in qqq.json.'
	] );
}

console.log( 'test: requireCompleteMessageDocumentation (disabled)' );
{
	const result = bananaChecker(
		'test/requireCompleteMessageDocumentation',
		{
			requireCompleteMessageDocumentation: false
		},
		function () {}
	);
	assert.strictEqual( result, PASS );
}

console.log( 'test: requireMetadata' );
{
	const result = bananaChecker(
		'test/requireMetadata',
		{
			requireMetadata: true
		},
		function () {}
	);
	assert.strictEqual( result, FAIL );
}

console.log( 'test: requireMetadata (disabled)' );
{
	const result = bananaChecker(
		'test/requireMetadata',
		{
			requireMetadata: false
		},
		function () {}
	);
	assert.strictEqual( result, PASS );
}

console.log( 'test: skipIncompleteMessageDocumentation' );
{
	const result = bananaChecker(
		'test/skipIncompleteMessageDocumentation',
		{
			skipIncompleteMessageDocumentation: [
				'third-message-key',
				'fourth-message-key'
			]
		},
		function () {}
	);
	assert.strictEqual( result, PASS );
}

console.log( 'test: requireLowerCase' );
{
	const result = bananaChecker(
		'test/requireLowerCase/full',
		{
			requireLowerCase: true
		},
		function () {}
	);
	assert.strictEqual( result, FAIL );
}

console.log( 'test: requireLowerCase (disabled)' );
{
	// Allow any mixed case
	const result = bananaChecker(
		'test/requireLowerCase/full',
		{
			requireLowerCase: false
		},
		function () {}
	);
	assert.strictEqual( result, PASS );
}

console.log( 'test: requireLowerCase=initial' );
{
	// Allow mixed case, but still require lowercase initial
	const result = bananaChecker(
		'test/requireLowerCase/initial',
		{
			requireLowerCase: 'initial'
		},
		function () {}
	);
	assert.strictEqual( result, PASS );
}

console.log( 'test: requireKeyPrefix (string, correct)' );
{
	const result = bananaChecker(
		'test/requireKeyPrefix/single',
		{
			requireKeyPrefix: 'alice'
		},
		function () {}
	);
	assert.strictEqual( result, PASS );
}

console.log( 'test: requireKeyPrefix (string, wrong)' );
{
	const result = bananaChecker(
		'test/requireKeyPrefix/single',
		{
			requireKeyPrefix: 'bob'
		},
		function () {}
	);
	assert.strictEqual( result, FAIL );
}

console.log( 'test: requireKeyPrefix (array/single, correct)' );
{
	const result = bananaChecker(
		'test/requireKeyPrefix/single',
		{
			requireKeyPrefix: [ 'alice' ]
		},
		function () {}
	);
	assert.strictEqual( result, PASS );
}

console.log( 'test: requireKeyPrefix (array/multiple, correct)' );
{
	const result = bananaChecker(
		'test/requireKeyPrefix/multiple',
		{
			requireKeyPrefix: [ 'alice', 'bob', 'timmy' ]
		},
		function () {}
	);
	assert.strictEqual( result, PASS );
}

console.log( 'test: allowLeadingWhitespace (enabled)' );
{
	const result = bananaChecker(
		'test/allowLeadingWhitespace',
		{
			allowLeadingWhitespace: true
		},
		function () {}
	);
	assert.strictEqual( result, PASS );
}

console.log( 'test: allowLeadingWhitespace (disabled)' );
{
	const errs = [],
		result = bananaChecker(
			'test/allowLeadingWhitespace',
			{
				allowLeadingWhitespace: false
			},
			function ( err ) { errs.push( err ); }
		);

	assert.strictEqual( result, FAIL );
	assert.deepStrictEqual( errs, [
		'3 messages have leading whitespace:',
		'Message "first-message-key" has leading whitespace',
		'Message "second-message-key" has leading whitespace',
		'Message "third-message-key" has leading whitespace',
		'3 message documentations have leading whitespace:',
		'Message documentation "first-message-key" has leading whitespace',
		'Message documentation "second-message-key" has leading whitespace',
		'Message documentation "third-message-key" has leading whitespace',
		'The "de" translation has 3 translations with leading whitespace:',
		'The translation of "first-message-key" has leading whitespace.',
		'The translation of "second-message-key" has leading whitespace.',
		'The translation of "third-message-key" has leading whitespace.',
		'The "fr" translation has 3 translations with leading whitespace:',
		'The translation of "first-message-key" has leading whitespace.',
		'The translation of "second-message-key" has leading whitespace.',
		'The translation of "third-message-key" has leading whitespace.'
	] );
}

console.log( 'test: allowTrailingWhitespace (enabled)' );
{
	const result = bananaChecker(
		'test/allowTrailingWhitespace',
		{
			allowTrailingWhitespace: true
		},
		function () {}
	);
	assert.strictEqual( result, PASS );
}

console.log( 'test: allowTrailingWhitespace (disabled)' );
{
	const errs = [],
		result = bananaChecker(
			'test/allowTrailingWhitespace',
			{
				allowTrailingWhitespace: false
			},
			function ( err ) { errs.push( err ); }
		);

	assert.strictEqual( result, FAIL );
	assert.deepStrictEqual( errs, [
		'3 messages have trailing whitespace:',
		'Message "first-message-key" has trailing whitespace',
		'Message "second-message-key" has trailing whitespace',
		'Message "third-message-key" has trailing whitespace',
		'3 message documentations have trailing whitespace:',
		'Message documentation "first-message-key" has trailing whitespace',
		'Message documentation "second-message-key" has trailing whitespace',
		'Message documentation "third-message-key" has trailing whitespace',
		'The "de" translation has 3 translations with trailing whitespace:',
		'The translation of "first-message-key" has trailing whitespace.',
		'The translation of "second-message-key" has trailing whitespace.',
		'The translation of "third-message-key" has trailing whitespace.',
		'The "fr" translation has 3 translations with trailing whitespace:',
		'The translation of "first-message-key" has trailing whitespace.',
		'The translation of "second-message-key" has trailing whitespace.',
		'The translation of "third-message-key" has trailing whitespace.'
	] );
}
