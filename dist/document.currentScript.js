/*!
 * document.currentScript
 * Polyfill for `document.currentScript`.
 * Copyright (c) 2015 James M. Greene
 * Licensed MIT
 * https://github.com/JamesMGreene/document.currentScript
 * v1.0.5
 */
(function() {


// Live NodeList collection
var scripts = document.getElementsByTagName("script");

// Check if the browser supports the `readyState` property on `script` elements
var supportsScriptReadyState = "readyState" in (scripts[0] || document.createElement("script"));

// Lousy browser detection for [not] Opera
var isNotOpera = !window.opera || window.opera.toString() !== "[object Opera]";

// Attempt to retrieve the native `document.currentScript` accessor method
var nativeCurrentScriptFn = (function(doc) {
  /*jshint proto:true */

  var hasNativeMethod = "currentScript" in doc;
  var canLookupGetter = doc.__lookupGetter__;
  var canGetDescriptor = typeof Object.getOwnPropertyDescriptor === "function";
  var canGetPrototype = typeof Object.getPrototypeOf === "function";
  var canUseDunderProto = typeof "test".__proto__ === "object";


  function _invokeNativeCurrentScriptMethod() {
    var des, getter,
        csFnIsNotOurs = true;

    if (canGetDescriptor) {
      des = Object.getOwnPropertyDescriptor(doc, "currentScript") || undefined;
      if (des && typeof des.get === "function" && des.get === _currentEvaluatingScript) {
        csFnIsNotOurs = false;
      }
    }
    if (csFnIsNotOurs && canLookupGetter) {
      getter = doc.__lookupGetter__("currentScript") || undefined;
      if (typeof getter === "function" && getter === _currentEvaluatingScript) {
        csFnIsNotOurs = false;
      }
    }

    // Potentially dangerous hack...
    return csFnIsNotOurs ? doc.currentScript : null;
  }

  function _getProto(obj) {
    var proto;
    if (obj != null) {
      proto = (
        canGetPrototype ? Object.getPrototypeOf(obj) :
          canUseDunderProto ? obj.__proto__ :
            obj.constructor != null ? obj.constructor.prototype :
              undefined
      );
    }
    return proto;
  }

  var nativeFn = (function _getCurrentScriptDef(docSelfOrAncestor, doc) {
    var des, cs;

    if (
      hasNativeMethod && (canLookupGetter || canGetDescriptor) &&
      docSelfOrAncestor && docSelfOrAncestor !== Object.prototype &&
      doc && doc !== Object.prototype
    ) {
      if (canGetDescriptor) {
        des = Object.getOwnPropertyDescriptor(docSelfOrAncestor, "currentScript") || undefined;
        if (des && typeof des.get === "function") {
          cs = des.get;
        }
      }
      if (!cs && canLookupGetter) {
        cs = docSelfOrAncestor.__lookupGetter__("currentScript") || undefined;
      }
      if (!cs) {
        cs = _getCurrentScriptDef(_getProto(docSelfOrAncestor), doc);
      }
    }

    if (!cs) {
      cs = _invokeNativeCurrentScriptMethod;
    }
    else if (cs === _currentEvaluatingScript) {
      cs = undefined;
    }

    return cs;
  })(doc, doc);

  return nativeFn;
})(document);



// Top-level API (compliant with `document.currentScript` specifications)
//
// Get the currently "executing" (i.e. EVALUATING) `script` DOM
// element, per the spec requirements for `document.currentScript`.
//
// IMPORTANT: This polyfill CANNOT achieve 100% accurate results
//            cross-browser. ;_;
function _currentEvaluatingScript() {
  // Yes, this IS possible, i.e. if a script removes other scripts (or itself)
  if (scripts.length === 0) {
    return null;
  }

  // Guaranteed accurate in IE 6-10.
  // Not supported in any other browsers. =(
  if (supportsScriptReadyState && isNotOpera) {
    for (var i = scripts.length; i--; ) {
      if (scripts[i].readyState === "interactive") {
        return scripts[i];
      }
    }
  }

  // If the native method exists, defer to that as a last-ditch effort
  if (
    typeof nativeCurrentScriptFn === "function" &&
    _currentEvaluatingScript.doNotDeferToNativeMethod !== true
  ) {
    return nativeCurrentScriptFn.call(document);
  }

  // Any other attempts cannot be guaranteed and, as such, should be left out
  // from this "Strict Mode" behavior.
  // Alas, returning `null` here is not necessarily accurate either.
  return null;
}

// Allow a last-ditch effort to use the native `document.currentScript` accessor
// method (if it exists and can be retrieved)?
_currentEvaluatingScript.doNotDeferToNativeMethod = false;



// Inspect the polyfill-ability of this browser
var needsPolyfill = !("currentScript" in document);
var canDefineGetter = document.__defineGetter__;
var canDefineProp = typeof Object.defineProperty === "function" &&
  (function() {
    var result;
    try {
      Object.defineProperty(document, "_xyz", {
        get: function() {
          return "blah";
        },
        configurable: true
      });
      result = document._xyz === "blah";
      delete document._xyz;
    }
    catch (e) {
      result = false;
    }
    return result;
  })();


// Add the "private" property for testing, even if the real property can be polyfilled
document._currentScript = _currentEvaluatingScript;

// Polyfill it!
if (needsPolyfill) {
  if (canDefineProp) {
    Object.defineProperty(document, "currentScript", {
      get: _currentEvaluatingScript
    });
  }
  else if (canDefineGetter) {
    document.__defineGetter__("currentScript", _currentEvaluatingScript);
  }
}

})();
