[![NPM version](https://badge.fury.io/js/grunt-banana-checker.svg)](http://badge.fury.io/js/grunt-banana-checker) [![Build Status](https://travis-ci.org/jdforrester/grunt-banana-checker.svg?branch=master)](https://travis-ci.org/jdforrester/grunt-banana-checker)
grunt-banana-checker
====================

A grunt checker for the "banana" JSON i18n system provided by MediaWiki and jquery.i18n.

Checks run:
* The source and documentation files both exist, and are both valid JSON.
* Both source and documentation include an "@metadata" object.
    - (Note that no parsing is done of the metadata objects.)
* Each defined source message has a matching defined documentation message.
    - (Note that no parsing is done of the message definitions or their documentation, including if they are simply the blank string "".)
* Each defined documentation message has a matching defined source message.
