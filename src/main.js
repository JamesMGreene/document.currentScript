var hasStackBeforeThrowing = false,
    hasStackAfterThrowing = false;
(function() {
  try {
    var err = new Error();
    hasStackBeforeThrowing = typeof err.stack === "string" && !!err.stack;
    throw err;
  }
  catch (thrownErr) {
    hasStackAfterThrowing = typeof thrownErr.stack === "string" && !!thrownErr.stack;
  }
})();


// This page's URL
var pageUrl = window.location.href;

// Live NodeList collection
var scripts = document.getElementsByTagName("script");

// Get script object based on the `src` URL
function getScriptFromUrl(url) {
  if (typeof url === "string" && url) {
    for (var i = 0, len = scripts.length; i < len; i++) {
      if (scripts[i].src === url) {
        return scripts[i];
      }
    }
  }
  //return undefined;
}

// If there is only a single inline script on the page, return it; otherwise `undefined`
function getSoleInlineScript() {
  var script;
  for (var i = 0, len = scripts.length; i < len; i++) {
    if (!scripts[i].src) {
      if (script) {
        return undefined;
      }
      script = scripts[i];
    }
  }
  return script;
}

// Get the configured default value for how many layers of stack depth to ignore
function getStackDepthToSkip() {
  var depth = 0;
  if (
    typeof _currentScript !== "undefined" &&
    _currentScript &&
    typeof _currentScript.skipStackDepth === "number"
  ) {
    depth = _currentScript.skipStackDepth;
  }
  return depth;
}

// Get the currently executing script URL from an Error stack trace
function getScriptUrlFromStack(stack, skipStackDepth) {
  var url, matches, remainingStack,
      ignoreMessage = typeof skipStackDepth === "number";
  skipStackDepth = ignoreMessage ? skipStackDepth : getStackDepthToSkip();
  if (typeof stack === "string" && stack) {
    if (ignoreMessage) {
      matches = stack.match(/((?:http[s]?|file):\/\/[\/]?.+?\/[^:\)]*?)(?::\d+)(?::\d+)?/);
    }
    else {
      matches = stack.match(/^(?:|[^:@]*@|.+\)@(?=http[s]?|file)|.+?\s+(?: at |@)(?:[^:\(]+ )*[\(]?)((?:http[s]?|file):\/\/[\/]?.+?\/[^:\)]*?)(?::\d+)(?::\d+)?/);
      if (!(matches && matches[1])) {
        matches = stack.match(/\)@((?:http[s]?|file):\/\/[\/]?.+?\/[^:\)]*?)(?::\d+)(?::\d+)?/);
        if (matches && matches[1]) {
          url = matches[1];
        }
      }
    }

    if (matches && matches[1]) {
      if (skipStackDepth > 0) {
        remainingStack = stack.slice(stack.indexOf(matches[0]) + matches[0].length);
        url = getScriptUrlFromStack(remainingStack, (skipStackDepth - 1));
      }
      else {
        url = matches[1];
      }
    }
  }
  return url;
}

// Get the currently executing `script` DOM element
function _currentScript() {
  // Yes, this IS actually possible
  if (scripts.length === 0) {
    return;  //return undefined;
  }

  if (scripts.length === 1) {
    return scripts[0];
  }

  if ("readyState" in scripts[0]) {
    for (var i = scripts.length; i--; ) {
      if (scripts[i].readyState === "interactive") {
        return scripts[i];
      }
    }
  }

  if (document.readyState === "loading") {
    return scripts[scripts.length - 1];
  }

  var stack,
      e = new Error();
  if (hasStackBeforeThrowing) {
    stack = e.stack;
  }
  if (!stack && hasStackAfterThrowing) {
    try {
      throw e;
    }
    catch (err) {
      // NOTE: Cannot use `err.sourceURL` or `err.fileName` as they will always be THIS script
      stack = err.stack;
    }
  }
  if (stack) {
    var url = getScriptUrlFromStack(stack);
    var script = getScriptFromUrl(url);
    if (!script && url === pageUrl) {
      script = getSoleInlineScript();
    }
    return script;
  }
  //return undefined;
}


// Configuration
_currentScript.skipStackDepth = 1;
