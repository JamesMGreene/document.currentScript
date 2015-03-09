/*jshint node:true, maxstatements: false, maxlen: false */

module.exports = function(grunt) {
  "use strict";

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks("grunt-contrib-jshint");
  grunt.loadNpmTasks("grunt-contrib-concat");
  grunt.loadNpmTasks("grunt-contrib-uglify");
  grunt.loadNpmTasks("grunt-karma");

  // Project configuration.
  grunt.initConfig({

    // Metadata.
    pkg: grunt.file.readJSON("package.json"),
    banner: "/*!\n" +
      " * <%= pkg.title || pkg.name %>\n" +
      " * <%= pkg.description %>\n" +
      " * Copyright (c) <%= grunt.template.today('yyyy') %> <%= pkg.author.name %>\n" +
      " * Licensed <%= _.pluck(pkg.licenses, 'type').join(', ') %>\n" +
      "<%= pkg.homepage ? ' * ' + pkg.homepage + '\\n' : '' %>" +
      " * v<%= pkg.version %>\n" +
      " */\n",

    // Task configuration.
    jshint: {
      options: {
        jshintrc: true
      },
      gruntfile: ["Gruntfile.js"],
      karma: ["karma.conf*.js"],
      js: ["src/**/*.js", "!src/start.js", "!src/end.js"],
      test: ["test/**/*.js"],
      dist: ["dist/*.js", "!dist/*.min.js"]
    },
    concat: {
      options: {
        banner: "<%= banner %>",
        stripBanners: true
      },
      dist: {
        src: ["src/start.js", "src/main.js", "src/end.js"],
        dest: "dist/<%= pkg.title %>.js"
      }
    },
    uglify: {
      options: {
        report: "min",
        preserveComments: "some"
      },
      dist: {
        src: ["<%= concat.dist.dest %>"],
        dest: "dist/<%= pkg.title %>.min.js"
      }
    },
    karma: (function() {
      var taskConfig = {
        local: {
          configFile: "karma.conf.js",
          autoWatch: false,
          singleRun: true
        },
        ci: {
          configFile: "karma.conf-ci.js"
        }
      };
      var maxConcurrency = 3;
      var karmaConfCi = require("./" + taskConfig.ci.configFile);
      var karmaCiTaskChain = [];
      karmaConfCi(
        {
          set: function(conf) {
            if (conf.browsers && conf.browsers.length > 0) {
              for (var i = 0, len = conf.browsers.length; i < len; i += maxConcurrency) {
                var target = {
                  configFile: taskConfig.ci.configFile
                };
                target.browsers = conf.browsers.slice(i, i + maxConcurrency);
                var targetName = "ci_" + ((i / maxConcurrency) + 1);
                taskConfig[targetName] = target;
                karmaCiTaskChain.push("karma:" + targetName);
              }
            }
          }
        },
        true
      );

      // `grunt-karma` does not correctly honor buffering launcher
      // requests to the limit of maxConcurrency of a SauceLabs
      // account, which usually results in lots of errors
      grunt.registerTask("karma-ci-chain", karmaCiTaskChain);

      return taskConfig;
    })()
  });

  // Helper tasks
  grunt.registerTask("jshint-prebuild",  ["jshint:gruntfile", "jshint:karma", "jshint:js", "jshint:test"]);
  grunt.registerTask("jshint-postbuild", ["jshint:dist"]);

  // Default task.
  grunt.registerTask("default", ["jshint-prebuild", "concat", "uglify", "jshint-postbuild", "karma:local"]);
  // TravisCI task.
  grunt.registerTask("travis",  ["jshint-prebuild", "concat", "jshint-postbuild", "karma-ci-chain"]);

};
