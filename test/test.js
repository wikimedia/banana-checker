/* eslint-disable no-console */
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
	let errs = [];
	const result = bananaChecker(
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
	let errs = [];
	const result = bananaChecker(
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

console.log( 'test: requireCompleteMessageDocumentation' );
{
	let errs = [];
	const result = bananaChecker(
		'test/requireCompleteMessageDocumentation',
		{
			requireCompleteMessageDocumentation: true
		},
		function ( err ) { errs.push( err ); }
	);
	assert.strictEqual( result, FAIL );
	assert.deepStrictEqual( errs, [
		'1 message lacks documentation.',
		'Message "third-message-key" lacks documentation.'
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
