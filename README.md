# `document.currentScript`
[![GitHub Latest Release](https://badge.fury.io/gh/JamesMGreene%2Fdocument.currentScript.png)](https://github.com/JamesMGreene/document.currentScript) [![Build Status](https://secure.travis-ci.org/JamesMGreene/document.currentScript.png?branch=master)](https://travis-ci.org/JamesMGreene/document.currentScript) [![Sauce Test Status](https://saucelabs.com/buildstatus/JamesMGreene_dcs)](https://saucelabs.com/u/JamesMGreene_dcs) [![Dependency Status](https://david-dm.org/JamesMGreene/document.currentScript.png?theme=shields.io)](https://david-dm.org/JamesMGreene/document.currentScript) [![Dev Dependency Status](https://david-dm.org/JamesMGreene/document.currentScript/dev-status.png?theme=shields.io)](https://david-dm.org/JamesMGreene/document.currentScript#info=devDependencies)

[![Sauce Test Status](https://saucelabs.com/browser-matrix/JamesMGreene_dcs.svg)](https://saucelabs.com/u/JamesMGreene_dcs)

Polyfill of HTML5's [`document.currentScript`](http://www.whatwg.org/specs/web-apps/current-work/multipage/dom.html#dom-document-currentscript) for IE 6-10 _**ONLY**_.


## Overview

### Strict

This polyfill is configured do its best to comply with the HTML spec's definition of the correct behavior for `document.currentScript`.

More particularly, this will get the `script` element that was the source of the nearest currently executing code _but **ONLY** if said source script is being **evaluated _synchronously_** for the first time by the browser.

In other words, if code is being operated on _after_ its **initial** evaluation (e.g. async callbacks, functions invoked by user actions, etc.), then `document.currentScript` will always return `null`.

### Loose

If you are interested in getting the currently _executing_ script [regardless of the source/trigger of the exection], take a look at [JamesMGreene/currentExecutingScript](https://github.com/JamesMGreene/currentExecutingScript) instead.


## Browser Compatibility

| Browser | Version  | Works? | Notes                                 |
|---------|---------:|:------:|---------------------------------------|
| IE      |        6 |  :+1:  | Must use `document._currentScript()`. |
| IE      |        7 |  :+1:  | Must use `document._currentScript()`. |
| IE      |        8 |  :+1:  | Must use `document._currentScript()`. |
| IE      |        9 |  :+1:  |                                       |
| IE      |       10 |  :+1:  |                                       |
| IE      |       11 |  :-1:  | IE removed `script.readyState` but didn't add `document.currentScript` yet! :astonished: |
| *       |        * | :question: | Only if the browser natively supports `document.currentScript`. |


## Usage

### IE 9-10

```js
var scriptEl = document.currentScript;
```

### IE 6-8 (and IE 9-10)

```js
var scriptEl = document._currentScript();
```


## Configuration

### `doNotDeferToNativeMethod`

To support better cross-browser support, the default behavior of this polyfill in browsers other than IE 6-10 is to attempt to retrieve the native `document.currentScript` accessor method and use it as a last-ditch fallback effort.

However, if you would prefer to disallow that fallback behavior, you can do so as follows:

```js
document._currentScript.doNotDeferToNativeMethod = true;
```


## Other Documentation

 - MDN docs: https://developer.mozilla.org/en-US/docs/Web/API/document.currentScript


## Errata

 - Demo using old Gist: http://jsfiddle.net/JamesMGreene/9DFc9/
 - Original location, old Gist: https://gist.github.com/JamesMGreene/fb4a71e060da6e26511d
