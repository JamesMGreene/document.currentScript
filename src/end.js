

// Inspect the polyfill-ability of this browser
var needsPolyfill = !("currentScript" in document);
var canDefineGetter = document.__defineGetter__;
var canDefineProp = typeof Object.defineProperty === "function" &&
  (function() {
    var result;
    try {
      Object.defineProperty(document, "_xyz", {
        value: "blah",
        enumerable: true,
        writable: false,
        configurable: false
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
document._currentScript = _currentScript;

// Polyfill it!
if (needsPolyfill) {
  if (canDefineProp) {
    Object.defineProperty(document, "currentScript", {
      get: _currentScript,
      enumerable: true,
      configurable: false
    });
  }
  else if (canDefineGetter) {
    document.__defineGetter__("currentScript", _currentScript);
  }
}

})();
