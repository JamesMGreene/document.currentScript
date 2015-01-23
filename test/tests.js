/*global QUnit, getScriptUrlFromStack, _currentScript */

(function(module, test, skip) {
  /*jshint maxstatements:false */
  "use strict";

  var hasNativeSupport = "currentScript" in document;

  // Synchronous execution required here outside of the test callback context
  var polyfillResultSync;
  try {
    polyfillResultSync = _currentScript();
  }
  catch (e) {
    // Oh well....
  }

  var nativeResultSync;
  if (hasNativeSupport) {
    try {
      nativeResultSync = document.currentScript;
    }
    catch (e) {
      // Oh well....
    }
  }

  var inlineStackTemplates = [
        {
          browser:     "Chrome (Windows)",
          stackPrefix: "Error: my uncaught error\n    at ",
          stackSuffix: ":139:7\n    at jQuery.event.dispatch (http://code.jquery.com/blah.js:123:0)\n    at foo"
        },
        {
          browser:     "Firefox 3.6 (Windows)",
          stackPrefix: "Error(\"my error\")@:0\u000a([object Object])@",
          stackSuffix: ":129\u000a([object Object])@http://code.jquery.com/blah.js:123\u000afoo"
        },
        {
          browser:     "IE 10.0 (Windows)",
          stackPrefix: "Error: my uncaught error\n    at ",
          stackSuffix: ":139:7\n    at jQuery.event.dispatch (http://code.jquery.com/blah.js:123:0)\n    at foo"
        },
        {
          browser:     "IE 10.0 (Windows) with custom error message",
          stackPrefix: "Error: my sneaky error message has a URL in it at http://google.com/mean.js:123\n    at Anonymous function (",
          stackSuffix: ":133:5)\n    at dispatch (http://code.jquery.com/blah.js:123:0)\n    at foo"
        },
        {
          browser:     "Opera (Windows)",
          stackPrefix: "<anonymous function>([arguments not available])@",
          stackSuffix: ":139\n<anonymous function: dispatch>([arguments not available])@http://code.jquery.com/blah.js:123\nfoo"
        },
        {
          browser:     "PhantomJS (Windows)",
          stackPrefix: "Error: my error\n    at ",
          stackSuffix: ":139\n    at http://code.jquery.com/blah.js:123\nfoo"
        },
        {
          browser:     "Safari 6.0 (Mac)",
          stackPrefix: "@",
          stackSuffix: ":139\ndispatch@http://code.jquery.com/blah.js:123\nfoo"
        },
        {
          browser:     "Safari 6.1 (Mac)",
          stackPrefix: "",
          stackSuffix: ":139:7\ndispatch@http://code.jquery.com/blah.js:123:12\nfoo"
        },
        {
          browser:     "Safari 7.0 (iOS)",
          stackPrefix: "",
          stackSuffix: ":139:7\ndispatch@http://code.jquery.com/blah.js:123:12\nfoo"
        }
      ];

  var externalStackTemplates = [
        {
          browser:     "Chrome (Windows)",
          stackPrefix: "Error: my error\n    at window.onload (",
          stackSuffix: ":95:11)\n    at jQuery.event.dispatch (http://code.jquery.com/blah.js:123:0)\n    at foo"
        },
        {
          browser:     "Firefox 3.6 (Windows)",
          stackPrefix: "Error(\"my error\")@:0\u000a@",
          stackSuffix: ":95\u000a([object Object])@http://code.jquery.com/blah.js:123\u000afoo"
        },
        {
          browser:     "IE 10.0 (Windows)",
          stackPrefix: "Error: my error\n    at onload (",
          stackSuffix: ":95:11)\n    at dispatch (http://code.jquery.com/blah.js:123:0)\n    at foo"
        },
        {
          browser:     "IE 10.0 (Windows) with custom error message",
          stackPrefix: "Error: my sneaky error message has a URL in it at http://google.com/mean.js:123\n    at onload (",
          stackSuffix: ":95:11)\n    at dispatch (http://code.jquery.com/blah.js:123:0)\n    at foo"
        },
        {
          browser:     "Opera (Windows)",
          stackPrefix: "<anonymous function: window.onload>([arguments not available])@",
          stackSuffix: ":95\n<anonymous function: dispatch>([arguments not available])@http://code.jquery.com/blah.js:123\nfoo"
        },
        {
          browser:     "PhantomJS (Windows)",
          stackPrefix: "Error: my error\n    at ",
          stackSuffix: ":95\n    at http://code.jquery.com/blah.js:123\nfoo"
        },
        {
          browser:     "Safari 6.0 (Mac)",
          stackPrefix: "onload@",
          stackSuffix: ":95\ndispatch@http://code.jquery.com/blah.js:123\nfoo"
        },
        {
          browser:     "Safari 6.1 (Mac)",
          stackPrefix: "onload@",
          stackSuffix: ":95:11\ndispatch@http://code.jquery.com/blah.js:123:12\nfoo"
        },
        {
          browser:     "Safari 7.0 (iOS)",
          stackPrefix: "onload@",
          stackSuffix: ":95:11\ndispatch@http://code.jquery.com/blah.js:123:12\nfoo"
        }
      ];


  var _originalStackDepth;
  module("Stack parsing", {
    setup: function() {
      _originalStackDepth = _currentScript.skipStackDepth;
      // Default is `1` but we are testing with the non-wrapped version so we need to reduce this to `0`
      _currentScript.skipStackDepth = 0;
    },
    teardown: function() {
      _currentScript.skipStackDepth = _originalStackDepth;
    }
  });


  test("`getScriptUrlFromStack` handles bad input", function(assert) {
    assert.expect(12);

    // Act & Assert
    assert.strictEqual(undefined, getScriptUrlFromStack(), "Should work when stack is not provided");
    assert.strictEqual(undefined, getScriptUrlFromStack(undefined), "Should work when stack is `undefined`");
    assert.strictEqual(undefined, getScriptUrlFromStack(null), "Should work when stack is `null`");
    assert.strictEqual(undefined, getScriptUrlFromStack(false), "Should work when stack is `false`");
    assert.strictEqual(undefined, getScriptUrlFromStack(true), "Should work when stack is `true`");
    assert.strictEqual(undefined, getScriptUrlFromStack(NaN), "Should work when stack is `NaN`");
    assert.strictEqual(undefined, getScriptUrlFromStack(0), "Should work when stack is `0`");
    assert.strictEqual(undefined, getScriptUrlFromStack(2), "Should work when stack is some non-falsy number");
    assert.strictEqual(undefined, getScriptUrlFromStack({}), "Should work when stack is an object");
    assert.strictEqual(undefined, getScriptUrlFromStack([]), "Should work when stack is an array");
    assert.strictEqual(undefined, getScriptUrlFromStack(function() {}), "Should work when stack is a function");
    assert.strictEqual(undefined, getScriptUrlFromStack(""), "Should work when stack is an empty string");
  });


  test("`getScriptUrlFromStack` parses inline script stacks correctly", function(assert) {
    assert.expect(inlineStackTemplates.length + 1);

    // Arrange
    var expected = "http://jsfiddle.net/JamesMGreene/t5dzL/show/";
    var stack;

    // Act & Assert
    assert.ok(inlineStackTemplates.length > 0, "Should have a list of inline stack templates");
    for (var i = 0, len = inlineStackTemplates.length; i < len; i++) {
      stack = inlineStackTemplates[i].stackPrefix + expected + inlineStackTemplates[i].stackSuffix;
      assert.strictEqual(getScriptUrlFromStack(stack), expected, "Should work for inline stack from " + inlineStackTemplates[i].browser);
    }
  });


  test("`getScriptUrlFromStack` parses external script stacks correctly", function(assert) {
    assert.expect(externalStackTemplates.length + 1);

    // Arrange
    var expected = "https://rawgit.com/JamesMGreene/b6b3d263f0806c5a9ab4/raw/0c4471eb6bee8ceef976ed72f36218eca0dc4b19/jsfiddle_7WE33.js";
    var stack;

    // Act & Assert
    assert.ok(externalStackTemplates.length > 0, "Should have a list of external stack templates");
    for (var i = 0, len = externalStackTemplates.length; i < len; i++) {
      stack = externalStackTemplates[i].stackPrefix + expected + externalStackTemplates[i].stackSuffix;
      assert.strictEqual(getScriptUrlFromStack(stack), expected, "Should work for external stack from " + externalStackTemplates[i].browser);
    }
  });


  test("`getScriptUrlFromStack` parses Blob URI script stacks correctly", function(assert) {
    assert.expect(externalStackTemplates.length + 1);

    // Arrange
    var expected = "blob:https://rawgit.com/0c4471eb6bee8ceef976ed72f36218eca0dc4b19.js";
    var stack;

    assert.ok(externalStackTemplates.length > 0, "Should have a list of Blob URI stack templates");
    for (var i = 0, len = externalStackTemplates.length; i < len; i++) {
      stack = externalStackTemplates[i].stackPrefix + expected + externalStackTemplates[i].stackSuffix;
      assert.strictEqual(getScriptUrlFromStack(stack), expected, "Should work for Blob URI stack from " + externalStackTemplates[i].browser);
    }
  });


  test("`getScriptUrlFromStack` parses Data URI script stacks correctly", function(assert) {
    // Arrange
    var expectedUrls = [
      "data:text/javascript,console.log(document.currentScript)%3B",
      "data:text/javascript;charset=UTF-8,console.log(document.currentScript)%3B",
      "data:text/javascript;charset=UTF-8;base64,Y29uc29sZS5sb2coZG9jdW1lbnQuY3VycmVudFNjcmlwdCk7",
      "data:text/javascript;base64,Y29uc29sZS5sb2coZG9jdW1lbnQuY3VycmVudFNjcmlwdCk7"
    ];
    var stack;

    assert.expect(externalStackTemplates.length * expectedUrls.length + 2);

    // Act & Assert
    assert.ok(externalStackTemplates.length > 0, "Should have a list of Data URI stack templates");
    assert.ok(expectedUrls.length > 0, "Should have a list of Data URI script contents");
    for (var i = 0, len = externalStackTemplates.length; i < len; i++) {
      for (var j = 0, len2 = expectedUrls.length; j < len2; j++) {
        stack = externalStackTemplates[i].stackPrefix + expectedUrls[j] + externalStackTemplates[i].stackSuffix;
        assert.strictEqual(getScriptUrlFromStack(stack), expectedUrls[j], "Should work for Data URI stack (Variation #" + (j + 1) + ") from " + externalStackTemplates[i].browser);
      }
    }
  });


  module("`_currentScript()` follows the spec");

  test("When invoked during a script's synchronous evaluation", function(assert) {
    assert.expect(4);

    var polyfillResultIsNonNullObject = polyfillResultSync != null && typeof polyfillResultSync === "object";
    var polyfillResultSrc = polyfillResultIsNonNullObject ? (polyfillResultSync.hasAttribute("src") ? polyfillResultSync.src : null) : undefined;
    var polyfillResultSrcSuffix = polyfillResultSrc ? polyfillResultSrc.replace(/\?.*$/, "").slice(-9).toLowerCase() : polyfillResultSrc;

    assert.strictEqual(polyfillResultIsNonNullObject, true, "`_currentScript()` should return a non-`null` object");
    assert.strictEqual(polyfillResultSync.nodeName, "SCRIPT", "`_currentScript()` should return a `script` node");
    assert.strictEqual(polyfillResultSync.hasAttribute("src"), true, "`_currentScript()` should return a `script` node with a `src` attribute");
    assert.strictEqual(polyfillResultSrcSuffix, "/tests.js", "`_currentScript().src` should return the test script's path");
  });

  test("When invoked outside of a script's synchronous evaluation (so, asynchronously)", function(assert) {
    assert.expect(1);

    // While QUnit currently invokes these test callback functions asynchronously,
    // I want to guarantee the parameters of this test setup even if that fact
    // changes in the future. As such, let's force asynchrony here.
    var done = assert.async();

    setTimeout(function() {
      assert.strictEqual(_currentScript(), null, "`_currentScript()` should return `null`");
      done();
    }, 13);
  });


  module("Native `document.currentScript` follows the spec");

  (hasNativeSupport ? test : skip)("When invoked during a script's synchronous evaluation", function(assert) {
    assert.expect(4);

    var nativeResultIsNonNullObject = nativeResultSync != null && typeof nativeResultSync === "object";
    var nativeResultSrc = nativeResultIsNonNullObject ? (nativeResultSync.hasAttribute("src") ? nativeResultSync.src : null) : undefined;
    var nativeResultSrcSuffix = nativeResultSrc ? nativeResultSrc.replace(/\?.*$/, "").slice(-9).toLowerCase() : nativeResultSrc;

    assert.strictEqual(nativeResultIsNonNullObject, true, "`document.currentScript` should return a non-`null` object");
    assert.strictEqual(nativeResultSync.nodeName, "SCRIPT", "`document.currentScript` should return a `script` node");
    assert.strictEqual(nativeResultSync.hasAttribute("src"), true, "`document.currentScript` should return a `script` node with a `src` attribute");
    assert.strictEqual(nativeResultSrcSuffix, "/tests.js", "`document.currentScript.src` should return the test script's path");
  });

  (hasNativeSupport ? test : skip)("When invoked outside of a script's synchronous evaluation (so, asynchronously)", function(assert) {
    assert.expect(1);

    // While QUnit currently invokes these test callback functions asynchronously,
    // I want to guarantee the parameters of this test setup even if that fact
    // changes in the future. As such, let's force asynchrony here.
    var done = assert.async();

    setTimeout(function() {
      assert.strictEqual(document.currentScript, null, "`document.currentScript` should return `null`");
      done();
    }, 13);
  });


  module("`_currentScript()` and native `document.currentScript` results match");

  (hasNativeSupport ? test : skip)("When invoked during a script's synchronous evaluation", function(assert) {
    assert.expect(1);
    assert.strictEqual(polyfillResultSync, nativeResultSync, "Results should match");
  });

  (hasNativeSupport ? test : skip)("When invoked outside of a script's synchronous evaluation (so, asynchronously)", function(assert) {
    assert.expect(1);
    assert.strictEqual(_currentScript(), document.currentScript, "Results should match");
  });

})(QUnit.module, QUnit.test, QUnit.skip);
