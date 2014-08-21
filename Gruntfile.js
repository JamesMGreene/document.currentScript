/*jshint node:true, maxstatements: false, maxlen: false */

module.exports = function(grunt) {
  "use strict";

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks("grunt-contrib-jshint");
  grunt.loadNpmTasks("grunt-contrib-concat");
  grunt.loadNpmTasks("grunt-contrib-uglify");
  grunt.loadNpmTasks("grunt-contrib-qunit");

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
        src: ["src/start.js", "src/<%= pkg.title %>.js", "src/end.js"],
        dest: "dist/<%= pkg.title %>.js"
      }
    },
    uglify: {
      options: {
        report: "min",
        banner: "<%= banner %>",
        stripBanners: true
      },
      dist: {
        src: "<%= concat.dist.dest %>",
        dest: "dist/<%= pkg.title %>.min.js"
      }
    },
    qunit: {
      files: ["test/**/*.html"]
    }
  });


  // Helper tasks
  grunt.registerTask("jshint-prebuild",  ["jshint:gruntfile", "jshint:js", "jshint:test"]);
  grunt.registerTask("jshint-postbuild", ["jshint:dist"]);

  // Default task.
  grunt.registerTask("default", ["jshint-prebuild", "concat", "uglify", "jshint-postbuild", "qunit"]);
  // TravisCI task.
  grunt.registerTask("travis",  ["jshint-prebuild", "concat", "jshint-postbuild", "qunit"]);

};
