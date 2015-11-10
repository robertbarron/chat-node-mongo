'use strict';

module.exports = function (grunt) {
  grunt.initConfig({
    ambientes : {
      source: 'clientside/sass',
      dist: 'clientside/css',
      js: 'clientside/js/',
      vendors: 'clientside/vendors/'
    },
    concat: {
      dist: {
        dest: '<%= ambientes.dist %>/compiled.min.css',
        src: [
          'node_modules/zurb-foundation-npm/css/foundation.min.css',
          '<%= ambientes.vendors %>/fontello/css/fontello.css',
          '<%= ambientes.dist %>/style.css'

        ]
      }
    },
    sass: {
      dist: {
        files: {
          '<%= ambientes.dist %>/style.css': '<%= ambientes.source %>/main.scss'
        }
      }
    },
    clean: {
      all: {
        src: ['<%= ambientes.dist %>/', '<%= ambientes.js %>/compiled/']
      }
    },

    uglify: {
      dist: {
        files: {
          '<%= ambientes.js %>/compiled/chat.min.js': [
            '<%= ambientes.vendors %>/jquery/jquery-latest.min.js',
            '<%= ambientes.vendors %>/socket.io/socket.io-1.3.7.js',
            '<%= ambientes.vendors %>/jpload/jpload.min.js',
            '<%= ambientes.js %>/models/loginModel.js',
            '<%= ambientes.js %>/controllers/loginController.js',
            '<%= ambientes.js %>/bootstraps/loginBootstrap.js',
            '<%= ambientes.js %>/models/registerModel.js',
            '<%= ambientes.js %>/controllers/registerController.js',
            '<%= ambientes.js %>/bootstraps/registerBootstrap.js',
            '<%= ambientes.js %>/models/chatModel.js',
            '<%= ambientes.js %>/controllers/chatController.js',
            '<%= ambientes.js %>/bootstraps/chatBootstrap.js',
            '<%= ambientes.js %>/models/chatWindowModel.js',
            '<%= ambientes.js %>/controllers/chatWindowController.js',
            '<%= ambientes.js %>/bootstraps/chatWindowBootstrap.js',
            '<%= ambientes.js %>/controllers/mainController.js',
            '<%= ambientes.js %>/bootstraps/mainBootstrap.js',
            '<%= ambientes.js %>/controllers/confirmationController.js',
            '<%= ambientes.js %>/bootstraps/confirmationBootstrap.js',
            '<%= ambientes.js %>/controllers/barController.js',
            '<%= ambientes.js %>/bootstraps/barBootstrap.js',
          ]
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-sass');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-uglify');

  grunt.registerTask('default', [
    'clean:all',
    'sass:dist',
    'concat:dist',
    'uglify'
  ]);
};