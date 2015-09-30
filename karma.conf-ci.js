/*jshint node:true, maxstatements: false, maxlen: false */
/*global JSON:false */

var fs = require("fs");
var path = require("path");

function getDirectories(srcPath) {
  return fs.readdirSync(srcPath).filter(function(file) {
    return fs.statSync(path.join(srcPath, file)).isDirectory();
  });
}

module.exports = function(config, gruntConfigOverride) {

  // Use ENV vars on Travis and sauce.json locally to get credentials
  if (!process.env.SAUCE_USERNAME) {
    if (!fs.existsSync("sauce.json")) {
      if (gruntConfigOverride !== true) {
        console.log("Create a \"sauce.json\" file with your credentials.");
        process.exit(1);
      }
    }
    else {
      process.env.SAUCE_USERNAME = require("./sauce").username;
      process.env.SAUCE_ACCESS_KEY = require("./sauce").accessKey;
    }
  }

  // Browsers to run on Sauce Labs
  var customLaunchers = generateCustomLaunchers();

  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: "",


    // Load plugins as needed
    plugins:
      getDirectories(path.resolve(path.join(__dirname, "/node_modules")))
        .filter(function(dirName) {
          return dirName.toLowerCase().slice(0, 6) === "karma-";
        }),


    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ["qunit"],


    // list of files / patterns to load in the browser
    files: [
      "src/main.js",
      "test/*.js"
    ],


    // test results reporter to use
    // possible values: "dots", "progress"
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ["dots", "saucelabs"],


    // web server port
    port: 9876,

    colors: true,

    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,

    sauceLabs: {

      testName: "`document.currentScript` polyfill unit tests",

      // For full list of Travis environment variables, see:
      //   http://docs.travis-ci.com/user/ci-environment/#Environment-variables
      tags:
        [
          prefixTag(process.env.TRAVIS_BRANCH, "branch"),
          prefixTag(process.env.TRAVIS_PULL_REQUEST, "pr"),
          prefixTag(process.env.TRAVIS_COMMIT, "commit"),
          prefixTag(process.env.TRAVIS_TAG, "tag")
        ]
        .filter(function(t) {
          // Remove useless tags
          return !!t && t !== "false";
        }),

      recordScreenshots: true,

      recordVideo: true,

      "public": "public"

    },

    captureTimeout: 120000,
    customLaunchers: customLaunchers,

    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: Object.keys(customLaunchers),
    singleRun: true
  });
};



//
// UTILITY & GENERATION CODE
//

function getFriendlyBrowser(browserName) {
  browserName = browserName || "";
  if (typeof browserName === "string" && browserName) {
    if (browserName === "internet explorer") {
      browserName = "ie";
    }
    else if (browserName === "iphone") {
      browserName = "safari";
    }
    else if (browserName === "android") {
      browserName = "browser";
    }
  }
  return browserName;
}

function getFriendlyOS(osName, browserName) {
  osName = osName || "";
  browserName = browserName || "";

  if (typeof osName === "string" && osName) {
    if (/^Windows /.test(osName)) {
      osName = "win";
    }
    else if (/^OS X /.test(osName)) {
      osName = browserName === "iphone" ? "ios" : "mac";
    }
    else if (osName === "Linux") {
      osName = browserName === "android" ? "android" : "linux";
    }
  }
  return osName;
}

function getKeyName(osName, browserName, version) {
  osName = getFriendlyOS(osName, browserName);
  browserName = getFriendlyBrowser(browserName);
  version = version === "" ? "latest" : version;
  return "sl_" + osName + "_" + browserName + "_" + version;
}

function prefixTag(tagValue, tagPrefix) {
  return tagValue ? (tagPrefix ? tagPrefix + ":" + tagValue : tagValue) : undefined;
}

function generateCustomLaunchers() {
  var browsers = {
    "internet explorer": {
      "11.0": ["Windows 8.1"],
      "10.0": ["Windows 8"],
      "9.0":  ["Windows 7"],
      "8.0":  ["Windows 7"],
      "7.0":  ["Windows XP"],
      "6.0":  ["Windows XP"]
    },
    "firefox": {
      "dev":  ["Windows 7", "OS X 10.9", "Linux"],
      "beta": ["Windows 7", "OS X 10.9", "Linux"],
      "":     ["Windows 7", "OS X 10.9", "Linux"]
    },
    "chrome": {
      "dev":  ["Windows 7", "OS X 10.8", "Linux"],
      "beta": ["Windows 7", "OS X 10.8", "Linux"],
      "":     ["Windows 7", "OS X 10.8", "Linux"]
    },
    "safari": {
      "8.0": ["OS X 10.10"],
      "7.0": ["OS X 10.9"],
      "6.0": ["OS X 10.8"],
      "5.1": ["OS X 10.6", "Windows 7"]
    },
    "opera": {
      "12.15": ["Linux"],
      "12.12": ["Windows 7"],
      "11.64": ["Windows 7"]
    },
    "android": {
      "4.4": ["Linux"],
      "4.0": ["Linux"]
    },
    "iphone": {
      "8.1": ["OS X 10.10"],
      "7.1": ["OS X 10.10"]
    }
  };

  var matrix = {};
  Object.keys(browsers).forEach(function(browserName) {
    Object.keys(browsers[browserName]).forEach(function(version) {
      browsers[browserName][version].forEach(function(osName) {
        var key = getKeyName(osName, browserName, version);
        if (matrix[key]) {
          throw new Error("Generated duplicate key: " + JSON.stringify(key));
        }
        matrix[key] = {
          base: "SauceLabs",
          browserName: browserName,
          platform: osName,
          version: version
        };
        if (browserName === "android") {
          matrix[key].deviceName = "Android Emulator";
          matrix[key]["device-orientation"] = "portrait";
        }
        if (browserName === "iphone") {
          matrix[key].deviceName = "iPhone Simulator";
          matrix[key]["device-orientation"] = "portrait";
        }
      });
    });
  });
  return matrix;
}
