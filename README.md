# `document.currentScript`
[![GitHub Latest Release](https://badge.fury.io/gh/JamesMGreene%2Fdocument.currentScript.png)](https://github.com/JamesMGreene/document.currentScript) [![Build Status](https://secure.travis-ci.org/JamesMGreene/document.currentScript.png?branch=master)](https://travis-ci.org/JamesMGreene/document.currentScript) [![Sauce Test Status](https://saucelabs.com/buildstatus/JamesMGreene_dcs)](https://saucelabs.com/u/JamesMGreene_dcs) [![Dependency Status](https://david-dm.org/JamesMGreene/document.currentScript.png?theme=shields.io)](https://david-dm.org/JamesMGreene/document.currentScript) [![Dev Dependency Status](https://david-dm.org/JamesMGreene/document.currentScript/dev-status.png?theme=shields.io)](https://david-dm.org/JamesMGreene/document.currentScript#info=devDependencies)

[![Sauce Test Status](https://saucelabs.com/browser-matrix/JamesMGreene_dcs.svg)](https://saucelabs.com/u/JamesMGreene_dcs)

A polyfill of HTML5's [`document.currentScript`](http://www.whatwg.org/specs/web-apps/current-work/multipage/dom.html#dom-document-currentscript) for IE 6-10 _**ONLY**_.


## Public Service Announcement (PSA)

This polyfill will not work in IE11 because of a critical design choice made Microsoft ("Don't Call Me IE!") [\[1\]](https://msdn.microsoft.com/en-us/library/ie/bg182625.aspx)[\[2\]](https://msdn.microsoft.com/en-us/library/ie/dn384059.aspx)[\[3\]](http://www.nczonline.net/blog/2013/07/02/internet-explorer-11-dont-call-me-ie/)[\[4\]](http://blog.getify.com/ie11-please-bring-real-script-preloading-back/) in order to avoid consumers receiving an unnecessarily downgraded experience on websites that were making logic branch and feature decisions based on browser detection rather than feature detection.

However, Microsoft Edge (a.k.a. "Spartan", a.k.a. IE12) _does_ natively support `document.currentScript`. This is likely due in part to you lovely consumers upvoting [this issue on the IE Platform Suggestion Forum](https://wpdev.uservoice.com/forums/257854-internet-explorer-platform/suggestions/6965085-support-document-currentscript-property), so _thank you!_


## Overview

### Strict

This polyfill is configured do its best to comply with the HTML spec's definition of the correct behavior for `document.currentScript`.

More particularly, this will get the `script` element that was the source of the nearest currently executing code _but **ONLY** if said source script is being **evaluated synchronously** for the first time by the browser._

In other words, if code is being operated on _after_ its **initial** evaluation (e.g. async callbacks, functions invoked by user actions, etc.), then `document.currentScript` will always return `null`.

### Loose

If you are interested in getting the currently _executing_ script [regardless of the source/trigger of the exection], take a look at [JamesMGreene/currentExecutingScript](https://github.com/JamesMGreene/currentExecutingScript) instead.


## Browser Compatibility

| Browser |  Version | Works?      | Notes                                 |
|---------|---------:|:-----------:|---------------------------------------|
| IE      |        6 | Yes         | Must use `document._currentScript()`. |
| IE      |        7 | Yes         | Must use `document._currentScript()`. |
| IE      |        8 | Yes         |                                       |
| IE      |        9 | Yes         |                                       |
| IE      |       10 | Yes         |                                       |
| IE      |       11 | **No!**     | IE removed `script.readyState` but didn't add `document.currentScript` yet! :astonished: See [PSA](#public-service-announcement-psa) for more info. |
| Edge    |        * | Yes         | Natively supports `document.currentScript`. |
| *       |        * | _Maybe...?_ | Only if the browser natively supports `document.currentScript`. |


## Installation

### NPM

```shell
npm install currentscript
```

### GitHub

Alternatively, you can download/clone its GitHub repo: [JamesMGreene/document.currentScript](https://github.com/JamesMGreene/document.currentScript)


## Usage

### IE 8-10

```js
var scriptEl = document.currentScript;
```

### IE 6-7

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
