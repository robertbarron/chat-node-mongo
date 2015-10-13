'use strict';

module.exports = function (grunt) {
  grunt.initConfig({
    ambientes : {
      source: 'clientside/sass',
      dist: 'clientside/css'
    },
    concat: {
      dist: {
        src: ['<%= ambientes.source %>/*.scss'],
        dest: '<%= ambientes.dist %>/all-sources.scss'
      }
    },
    sass: {
      dist: {
        files: {
          '<%= ambientes.dist %>/style.css': '<%= ambientes.dist %>/all-sources.scss'
        }
      }
    },
    clean: {
      dist: {
        src: ["<%= ambientes.dist %>/"]
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-sass');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-clean');

  grunt.registerTask('default', [
    'clean:dist',
    'concat:dist',
    'sass:dist'
  ]);
};