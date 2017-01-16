'use strict';

module.exports = function (grunt) {
  // Show elapsed time after tasks run
  require('time-grunt')(grunt);

  // Load all Grunt tasks (jit-grunt replaces load-grunt-tasks)
  require('jit-grunt')(grunt, {
    buildcontrol: 'grunt-build-control'
  });

  grunt.initConfig({
    // Paths
    dirs: {
      app: 'app',
      dist: 'dist'
    },

    clean: {
      dist: {
        files: [{
          dot: true,
          src: [
            '<%= dirs.dist %>/*',
          ]
        }]
      },
      server: [
        '.jekyll'
      ]
    },

    jekyll: {
      options: {
        config: '_config.yml,_config.build.yml',
        src: '<%= dirs.app %>'
      },
      dist: {
        options: {
          dest: '<%= dirs.dist %>',
        }
      },
      server: {
        options: {
          config: '_config.yml',
          dest: '.jekyll'
        }
      }
    },

    browserSync: {
      server: {
        bsFiles: {
          src: '.jekyll/**/*'  // Files to sync
        },
        options: {
          server: '.jekyll',  // Folder to serve from
          watchTask: true  // Allow other watch tasks to run after this task
        }
      },
      dist: {
        options: {
          server: '<%= dirs.dist %>'
        }
      }
    },

    watch: {
      jekyll: {
        files: [
          '<%= dirs.app %>/**/*',
          '_config.yml'
        ],
        tasks: ['jekyll:server']
      }
    },

    filerev: {
      options: {
        length: 4
      },
      dist: {
        files: [{
          src: [
            '<%= dirs.dist %>/assets/**/*'
          ]
        }]
      }
    },

    usemin: {
      options: {
        assetsDirs: [
          '<%= dirs.dist %>',  // Need this for absolute URLs
          '<%= dirs.dist %>/assets/css'  // Need this for relative URLs
        ]
      },
      html: ['<%= dirs.dist %>/**/*.html'],
      css: ['<%= dirs.dist %>/assets/css/**/*.css']
    },

    buildcontrol: {
      dist: {
        options: {
          remote: 'YOUR REPO HERE',
          branch: 'gh-pages',
          commit: true,
          push: true,
          connectCommits: false
        }
      }
    }
  });

  grunt.registerTask('serve', function (target) {
    if (target === 'dist') {
      return grunt.task.run(['build', 'browserSync:dist']);
    }

    grunt.task.run([
      'clean:server',  // Clean .jekyll
      'jekyll:server',  // Build into .jekyll once
      'browserSync:server',  // Start browserSync server
      'watch'  // Trigger jekyll:server on file changes
    ]);
  });

  grunt.registerTask('build', [
    'clean',  // Clean .jekyll and dist
    'jekyll:dist',  // Build into dist
    'filerev',  // Rename assets to include a hash
    'usemin',  // Update references to assets to use new names
    ]);

  grunt.registerTask('deploy', [
    'build',
    'buildcontrol',  // Push to Github
  ]);
};
