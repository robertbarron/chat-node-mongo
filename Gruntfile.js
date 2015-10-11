'use strict';

module.exports = function (grunt) {
  grunt.initConfig({
    ambientes : {
      source: 'clientside/sass',
      dist: 'clientside/css'
    },
    concat: {
      dist: {
        src: ['<%= ambientes.source %>/**/*.scss'],
        dest: '<%= ambientes.source %>/all-sources.scss'
      }
    },
    sass: {
      dist: {
        files: {
          '<%= ambientes.dist %>/style.css': '<%= ambientes.source %>/all-sources.scss'
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-sass');
  grunt.loadNpmTasks('grunt-contrib-concat');

  grunt.registerTask('default', ['concat', 'sass']);
};