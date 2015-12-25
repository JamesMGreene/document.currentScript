/*global QUnit, canPolyfill, _currentEvaluatingScript */
/*jshint maxstatements:false */

(function(module, test, skip) {
  "use strict";

  var hasNativeSupport = "currentScript" in document && canPolyfill;

  // Synchronous execution required here outside of the test callback context
  var polyfillResultSync;
  try {
    polyfillResultSync = _currentEvaluatingScript();
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


  // IE<8 does not have the `HTMLElement.prototype.hasAttribute` method
  function _hasAttribute(node, attrName) {
    var mayHaveAttr = (
      node &&
      node.nodeType === 1 &&
      typeof node[attrName] !== "undefined"
    );
    if (mayHaveAttr) {
      if (node.hasAttribute) {
        return node.hasAttribute(attrName);
      }
      return node.getAttribute(attrName) === node[attrName];
    }
    return false;
  }


  module("`_currentEvaluatingScript`");

  test("Is defined", function(assert) {
    assert.expect(1);
    assert.strictEqual(typeof _currentEvaluatingScript, "function", "Should be an exposed function");
  });


  module("`_currentEvaluatingScript()` follows the spec");

  (canPolyfill ? test : skip)("When invoked during a script's synchronous evaluation", function(assert) {
    assert.expect(4);

    var polyfillResultIsNonNullObject = polyfillResultSync != null && typeof polyfillResultSync === "object";
    var polyfillResultNodeName = polyfillResultIsNonNullObject ? polyfillResultSync.nodeName : undefined;
    var polyfillResultHasSrcAttr = polyfillResultIsNonNullObject ? _hasAttribute(polyfillResultSync, "src") : false;
    var polyfillResultSrc = polyfillResultIsNonNullObject ? (polyfillResultHasSrcAttr ? polyfillResultSync.src : null) : undefined;
    var polyfillResultSrcSuffix = polyfillResultSrc ? polyfillResultSrc.replace(/\?.*$/, "").slice(-9).toLowerCase() : polyfillResultSrc;

    assert.strictEqual(polyfillResultIsNonNullObject, true, "`_currentEvaluatingScript()` should return a non-`null` object");
    assert.strictEqual(polyfillResultNodeName, "SCRIPT", "`_currentEvaluatingScript()` should return a `script` node");
    assert.strictEqual(polyfillResultHasSrcAttr, true, "`_currentEvaluatingScript()` should return a `script` node with a `src` attribute");
    assert.strictEqual(polyfillResultSrcSuffix, "/tests.js", "`_currentEvaluatingScript().src` should return the test script's path");
  });

  (canPolyfill ? test : skip)("When invoked outside of a script's synchronous evaluation (so, asynchronously)", function(assert) {
    assert.expect(1);

    // While QUnit currently invokes these test callback functions asynchronously,
    // I want to guarantee the parameters of this test setup even if that fact
    // changes in the future. As such, let's force asynchrony here.
    var done = assert.async();

    setTimeout(function() {
      assert.strictEqual(_currentEvaluatingScript(), null, "`_currentEvaluatingScript()` should return `null`");
      done();
    }, 13);
  });


  module("Native `document.currentScript` follows the spec");

  (hasNativeSupport ? test : skip)("When invoked during a script's synchronous evaluation", function(assert) {
    assert.expect(4);

    var nativeResultIsNonNullObject = nativeResultSync != null && typeof nativeResultSync === "object";
    var nativeResultNodeName = nativeResultIsNonNullObject ? nativeResultSync.nodeName : undefined;
    var nativeResultHasSrcAttr = nativeResultIsNonNullObject ? _hasAttribute(nativeResultSync, "src") : false;
    var nativeResultSrc = nativeResultIsNonNullObject ? (nativeResultHasSrcAttr ? nativeResultSync.src : null) : undefined;
    var nativeResultSrcSuffix = nativeResultSrc ? nativeResultSrc.replace(/\?.*$/, "").slice(-9).toLowerCase() : nativeResultSrc;

    assert.strictEqual(nativeResultIsNonNullObject, true, "`document.currentScript` should return a non-`null` object");
    assert.strictEqual(nativeResultNodeName, "SCRIPT", "`document.currentScript` should return a `script` node");
    assert.strictEqual(nativeResultHasSrcAttr, true, "`document.currentScript` should return a `script` node with a `src` attribute");
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


  module("`_currentEvaluatingScript()` and native `document.currentScript` results match");

  (hasNativeSupport ? test : skip)("When invoked during a script's synchronous evaluation", function(assert) {
    assert.expect(1);
    assert.strictEqual(polyfillResultSync, nativeResultSync, "Results should match");
  });

  (hasNativeSupport ? test : skip)("When invoked outside of a script's synchronous evaluation (so, asynchronously)", function(assert) {
    assert.expect(1);
    assert.strictEqual(_currentEvaluatingScript(), document.currentScript, "Results should match");
  });

})(QUnit.module, QUnit.test, QUnit.skip);
