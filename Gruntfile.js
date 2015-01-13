/*jshint node:true, maxstatements: false, maxlen: false */

module.exports = function(grunt) {
  "use strict";
  var CONNECT_PORT = 8080,
      BASE_URL = "http://localhost:"+CONNECT_PORT;

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks("grunt-contrib-jshint");
  grunt.loadNpmTasks("grunt-contrib-concat");
  grunt.loadNpmTasks("grunt-contrib-uglify");
  grunt.loadNpmTasks("grunt-contrib-connect");
  grunt.loadNpmTasks("grunt-contrib-qunit");
  grunt.loadNpmTasks("grunt-saucelabs");

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
    connect: {
      server: {
        options: {
          base: "",
          port: CONNECT_PORT
        }
      }
    },
    qunit: {
      options: {
        httpBase: BASE_URL
      },
      files: ["test/**/*.html"]
    },
    "saucelabs-qunit": {
      all: {
        options: {
          urls: grunt.file.expand("test/**/*.html").map(function(specPath) {
            return BASE_URL+"/"+specPath;
          }),
          tunnelTimeout: 5,
          build: process.env.TRAVIS_JOB_ID || Date.now(),
          concurrency: 3,
          browsers: grunt.file.readYAML("browsers.yml"),
          testname: "qunit tests",
          tags: ["master"]
        }
      }
    }
  });


  // Helper tasks
  grunt.registerTask("jshint-prebuild",  ["jshint:gruntfile", "jshint:js", "jshint:test"]);
  grunt.registerTask("jshint-postbuild", ["jshint:dist"]);

  // Default task.
  grunt.registerTask("default", ["jshint-prebuild", "concat", "uglify", "jshint-postbuild", "connect", "qunit"]);
  // TravisCI task.
  grunt.registerTask("saucelabs",  ["jshint-prebuild", "concat", "jshint-postbuild", "connect", "saucelabs-qunit"]);

};
