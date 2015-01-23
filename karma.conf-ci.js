var fs = require('fs');

module.exports = function(config) {

  // Use ENV vars on Travis and sauce.json locally to get credentials
  if (!process.env.SAUCE_USERNAME) {
    if (!fs.existsSync('sauce.json')) {
      console.log('Create a "sauce.json" file with your credentials.');
      process.exit(1);
    } else {
      process.env.SAUCE_USERNAME = require('./sauce').username;
      process.env.SAUCE_ACCESS_KEY = require('./sauce').accessKey;
    }
  }

  // Browsers to run on Sauce Labs
  var customLaunchers = generateCustomLaunchers();

  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',


    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['qunit'],


    // list of files / patterns to load in the browser
    files: [
      'src/main.js',
      'test/*.js'
    ],


    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['dots', 'saucelabs'],


    // web server port
    port: 9876,

    colors: true,

    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,

    sauceLabs: {

      testName: '`document.currentScript` polyfill unit tests',

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
          return !!tag && tag !== "false";
        }),

      recordScreenshots: true,

      public: "public"

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
  browserName = browserName || '';
  if (typeof browserName === 'string' && browserName) {
    if (browserName === 'internet explorer') {
      browserName = 'ie';
    }
    else if (browserName === 'iphone') {
      browserName = 'safari';
    }
    else if (browserName === 'android') {
      browserName = 'browser';
    }
  }
  return browserName;
}

function getFriendlyOS(osName, browserName) {
  osName = osName || '';
  browserName = browserName || '';

  if (typeof osName === 'string' && osName) {
    if (/^Windows /.test(osName)) {
      osName = 'win';
    }
    else if (/^OS X /.test(osName)) {
      osName = browserName === 'iphone' ? 'ios' : 'mac';
    }
    else if (osName === 'Linux') {
      osName = browserName === 'android' ? 'android' : 'linux';
    }
  }
  return osName;
}

function getKeyName(osName, browserName, version) {
  osName = getFriendlyOS(osName, browserName);
  browserName = getFriendlyBrowser(browserName);
  version = version === '' ? 'latest' : version;
  return 'sl_' + osName + '_' + browserName + '_' + version;
}

function prefixTag(tagValue, tagPrefix) {
  return tagValue ? (tagPrefix ? tagPrefix + ":" + tagValue : tagValue) : undefined;
}

function generateCustomLaunchers() {
  var browsers = {
    'internet explorer': {
      '11': ['Windows 8.1'],
      '10': ['Windows 8'],
      '9':  ['Windows 7'],
      '8':  ['Windows 7']
    }
    'firefox': {
      'dev':  ['Windows 7', 'OS X 10.9', 'Linux'],
      'beta': ['Windows 7', 'OS X 10.9', 'Linux'],
      '':     ['Windows 7', 'OS X 10.9', 'Linux']
    },
    'chrome': {
      'dev':  ['Windows 7', 'OS X 10.8', 'Linux'],
      'beta': ['Windows 7', 'OS X 10.8', 'Linux'],
      '':     ['Windows 7', 'OS X 10.8', 'Linux']
    },
    'safari': {
      '8': ['OS X 10.10'],
      '7': ['OS X 10.9'],
      '6': ['OS X 10.8'],
      '5': ['OS X 10.6']
    },
    'opera': {
      '12': ['Windows 7', 'Linux']
    },
    'android': {
      '4.0': ['Linux']
    },
    'iphone': {
      '7.1': ['OS X 10.9']
    }
  };

  var matrix = {};
  Object.keys(browsers).forEach(function(browserName) {
    Object.keys(browsers[browserName]).forEach(function(version) {
      browsers[browserName][version].forEach(function(osName) {
        var key = getKeyName(osName, browserName, version);
        if (matrix[key]) {
          throw new Error('Generated duplicate key: ' + JSON.stringify(key));
        }
        matrix[key] = {
          base: 'SauceLabs',
          browserName: browserName,
          platform: osName,
          version: version
        };
      });
    });
  });
  return matrix;
}
