[![NPM version](https://badge.fury.io/js/grunt-banana-checker.svg)](http://badge.fury.io/js/grunt-banana-checker) [![Build Status](https://travis-ci.org/jdforrester/grunt-banana-checker.svg?branch=master)](https://travis-ci.org/jdforrester/grunt-banana-checker)
grunt-banana-checker
====================

> Task for checking JSON files for the "Banana" i18n system provided by MediaWiki and jquery.i18n.

Getting started
--------------------

If this is the first time you've used [grunt](http://gruntjs.com/), the [getting started guide](http://gruntjs.com/getting-started) will show you how to get up and running.

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

This is designed to be very simple and not need configuring for the most common case.

You can specify the targets and options for the task using the normal grunt configuration – see grunt's [guide on how to configure tasks](http://gruntjs.com/configuring-tasks) in general

### Options

For edge cases you can set some path options:

### sourceFile
Type: `string`
Default value: `"en.json"`

The JSON file providing the primary messages.

### documentationFile
Type: `string`
Default value: `"qqq.json"`

The JSON file providing the documentation messages.


Example uses
--------------------

[OOjs UI](https://www.mediawiki.org/wiki/VisualEditor) uses this on [a single directory of messages](http://git.wikimedia.org/blob/oojs%2Fui.git/HEAD/Gruntfile.js):

<pre lang=js>
banana: {
    all: 'i18n/'
}
</pre>

[VisualEditor](https://www.mediawiki.org/wiki/VisualEditor)'s MediaWiki extension uses this on [two directories as a single test](https://git.wikimedia.org/blob/mediawiki%2Fextensions%2FVisualEditor.git/HEAD/Gruntfile.js):

<pre lang=js>
banana: {
    all: 'modules/ve-{mw,wmf}/i18n/'
}
</pre>

[MediaWiki](https://www.mediawiki.org/wiki/MediaWiki) uses this on [two directories as different tests](https://git.wikimedia.org/blob/mediawiki%2Fcore.git/HEAD/tests%2Ffrontend%2FGruntfile.js) – one for the main software and another for the installer:

<pre lang=js>
banana: {
    core: 'languages/i18n/',
    installer: 'includes/installer/i18n/'
}
</pre>

Checks run
----------

* The source and documentation files both exist, and are both valid JSON.
* Both source and documentation include an "@metadata" object.
    - (Note that no parsing is done of the metadata objects.)
* Each defined source message has a matching defined documentation message.
    - (Note that no parsing is done of the message definitions or their documentation, including if they are simply the blank string "".)
* Each defined documentation message has a matching defined source message.
