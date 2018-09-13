[![NPM version](https://badge.fury.io/js/grunt-banana-checker.svg)](http://badge.fury.io/js/grunt-banana-checker) [![Build Status](https://travis-ci.org/wikimedia/grunt-banana-checker.svg?branch=master)](https://travis-ci.org/wikimedia/grunt-banana-checker)

grunt-banana-checker
====================

> Task for checking JSON files for the "Banana" i18n system provided by MediaWiki and jquery.i18n.

Getting started
--------------------

If this is the first time you're using [Grunt](http://gruntjs.com/), the [getting started guide](http://gruntjs.com/getting-started) will show you how to get up and running.

Once you have that installed, with a [Gruntfile](http://gruntjs.com/sample-gruntfile) set for your code, you can install the plugin with:

<pre lang=shell>
npm install grunt-banana-checker --save-dev
</pre>

In your Gruntfile, add the line:

<pre lang=js>
grunt.loadNpmTasks( 'grunt-banana-checker' );
</pre>

Running and configuring
--------------------

_Run this task with the `grunt banana` command._

This is designed to be very simple and not need configuring for the most common cases.

You can specify the targets and options for the task using the normal Grunt configuration – see Grunt's [guide on how to configure tasks](http://gruntjs.com/configuring-tasks) in general.

### Options

For edge cases, you can set some path options:

#### sourceFile
Type: `string`
Default value: `"en.json"`

The JSON file providing the primary messages.

#### documentationFile
Type: `string`
Default value: `"qqq.json"`

The JSON file providing the documentation messages.

#### requireMetadata
Type: `boolean`
Default value: `true`

Whether to fail if message files don't have a `@metadata` meta-data key.

#### requireCompleteMessageDocumentation
Type: `boolean`
Default value: `true`

Whether to fail if any message is in the primary file but not documented.

#### disallowEmptyDocumentation
Type: `boolean`
Default value: `true`

Whether to fail if any message is in the primary file but documented as a blank string.

#### requireLowerCase
Type: `boolean` or `"initial"`
Default value: `true`

Whether to fail if any message key is not lower case. If set to `"initial"`, fail only if the first
character is not lower case.

#### disallowUnusedDocumentation
Type: `boolean`
Default value: `true`

Whether to fail if any documented message isn't in the primary file.

#### disallowBlankTranslations
Type: `boolean`
Default value: `true`

Whether to fail if any message is translated as a blank string.

#### disallowDuplicateTranslations
Type: `boolean`
Default value: `false`

Whether to fail if any message is translated as identical to the original string.

#### disallowUnusedTranslations
Type: `boolean`
Default value: `false`

Whether to fail if any translated message isn't in the primary file.

#### requireCompleteTranslationLanguages
Type: `string[]`
Default value: `[]`
Example value: `[ 'fr', 'es' ]`

Languages on which to fail if any message in the primary file is missing.

#### requireCompleteTranslationMessages
Type: `string[]`
Default value: `[]`
Example value: `[ 'first-message-key', 'third-message-key' ]`

Messages on which to fail if missing in any provided language.


Example uses
--------------------

[OOjs UI](https://www.mediawiki.org/wiki/VisualEditor) uses this on [a single directory of messages](https://phabricator.wikimedia.org/diffusion/GOJU/browse/master/Gruntfile.js):

<pre lang=js>
banana: {
    all: 'i18n/'
}
</pre>

[VisualEditor](https://www.mediawiki.org/wiki/VisualEditor)'s MediaWiki extension uses this on [two directories as a single test](https://phabricator.wikimedia.org/diffusion/EVED/browse/master/Gruntfile.js):

<pre lang=js>
banana: {
    all: 'modules/ve-{mw,wmf}/i18n/'
}
</pre>

[MediaWiki](https://www.mediawiki.org/wiki/MediaWiki) uses this on [two directories as different tests](https://phabricator.wikimedia.org/source/mediawiki/browse/master/Gruntfile.js) – one for the main software and another for the installer:

<pre lang=js>
banana: {
    core: 'languages/i18n/',
    installer: 'includes/installer/i18n/'
}
</pre>

Checks run
----------

* The source and documentation files both exist, and are both valid JSON.
* Both source and documentation include a "@metadata" object.
    - (Note no parsing is done of the metadata objects.)
* Each defined source message has a matching defined documentation message.
    - (Note no parsing is done of the message definitions or their documentation, including if they are simply the blank string "".)
* Each defined documentation message has a matching defined source message.
