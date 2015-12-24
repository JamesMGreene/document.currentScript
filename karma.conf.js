/*jshint node:true, maxstatements:false, maxlen:false */

var fs = require("fs");
var path = require("path");

function getDirectories(srcPath) {
  return fs.readdirSync(srcPath).filter(function(file) {
    return fs.statSync(path.join(srcPath, file)).isDirectory();
  });
}

// Karma configuration for local
module.exports = function(config) {
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
    // built-in possible values: "dots", "progress"
    // other available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ["spec"],


    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,


    // Start these browsers, currently available:
    // - Chrome
    // - ChromeCanary
    // - Firefox
    // - Opera
    // - Safari (only Mac)
    // - PhantomJS
    // - IE (only Windows)
    browsers: ["Firefox", "PhantomJS", "Chrome", "Safari"],


    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: false

  });
};
