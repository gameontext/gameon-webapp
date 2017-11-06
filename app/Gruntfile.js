'use strict';

// configuration hash is factored out for testing
var gruntConfig = {

  app: {
    public: "public",
    dist: "dist"
  },

  // Empties folders to start fresh
  clean: {
    dist: {
      files: [{
        dot: true,
        src: [
          '.tmp',
          'build',
          'dist',
          'coverage'
        ]
      }]
    }
  },

  // Make sure code styles are up to par and there are no obvious mistakes
  jshint: {
    options: {
      jshintrc: '.jshintrc',
    },
    all: {
      src: [
        'Gruntfile.js',
        'karma.*.js',
        'public/scripts/**/*.js'
      ]
    },
    test: {
      options: {
        jshintrc: 'test/.jshintrc'
      },
      src: ['test/**/*.js']
    }
  },

  // angular-aware html linting
  htmlangular: {
    public: {
      options: {
        reportpath: null,
        reportCheckstylePath: null,
        angular: true
      },
      files: {
        src: ['public/index.html']
      }
    },
    templates: {
      options: {
        reportpath: null,
        reportCheckstylePath: null,
        tmplext: 'html',
        angular: true,
        customattrs: ['scroll-glue', 'marked'],
        customtags: ['profile-core']
      },
      files: {
        src: ['public/templates/*.html']
      }
    }
  },

  wiredep: {
    app: {
      src: '<%= app.public %>/index.html',
      ignorePath:  /\.\.\//,
    },
    test: {
      devDependencies: true,
      src: '<%= karma.unit.configFile %>',
      ignorePath:  /\.\.\//,
      fileTypes:{
        js: {
          block: /(([\s\t]*)\/{2}\s*?bower:\s*?(\S*))(\n|\r|.)*?(\/{2}\s*endbower)/gi,
          detect: {
            js: /'(.*\.js)'/gi
          },
          replace: {
            js: '\'{{filePath}}\','
          }
        }
      }
    }
  },

  // Copies remaining files to places other tasks can use
  copy: {
    dist: {
      files: [{
        expand: true,
        dot: true,
        cwd: '<%= app.public %>',
        dest: '<%= app.dist %>',
        src: [
          '*.{ico,png,txt}',
          '*.html',
          'images/{,*/}*.{webp}',
          'styles/fonts/{,*/}*.*'
        ]
      }, {
        expand: true,
        cwd: '.tmp/images',
        dest: '<%= app.dist %>/images',
        src: ['generated/*']
      }]
    },
    styles: {
      expand: true,
      cwd: '<%= app.public %>/styles',
      dest: '.tmp/styles/',
      src: '{,*/}*.css'
    }
  },

  imagemin: {
    dist: {
      files: [{
        expand: true,
        cwd: '<%= app.public %>/images',
        src: '{,*/}*.{png,jpg,jpeg,gif}',
        dest: '<%= app.dist %>/images'
      }]
    }
  },

  htmlmin: {
    dist: {
      options: {
        collapseWhitespace: true,
        conservativeCollapse: true,
        collapseBooleanAttributes: true,
        removeCommentsFromCDATA: true
      },
      files: [{
        expand: true,
        cwd: '<%= app.dist %>',
        src: ['*.html'],
        dest: '<%= app.dist %>'
      }]
    }
  },

  ngtemplates: {
    dist: {
      options: {
        module: 'angularUglifyApp',
        htmlmin: '<%= htmlmin.dist.options %>',
        usemin: 'scripts/scripts.js'
      },
      cwd: '<%= app.public %>',
      src: 'templates/{,*/}*.html',
      dest: '.tmp/templateCache.js'
    }
  },

  // ng-annotate tries to make the code safe for minification automatically
  // by using the Angular long form for dependency injection.
  ngAnnotate: {
    dist: {
      files: [{
        expand: true,
        cwd: '.tmp/concat/scripts',
        src: '*.js',
        dest: '.tmp/concat/scripts'
      }]
    }
  },

  // Renames files for browser caching purposes
  filerev: {
    dist: {
      src: [
        '<%= app.dist %>/scripts/{,*/}*.js',
        '<%= app.dist %>/styles/{,*/}*.css',
        '<%= app.dist %>/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}',
        '<%= app.dist %>/styles/fonts/*'
      ]
    }
  },

  // Reads HTML for usemin blocks to enable smart builds that automatically
  // concat, minify and revision files. Creates configurations in memory so
  // additional tasks can operate on them
  useminPrepare: {
    html: '<%= app.public %>/index.html',
    options: {
      dest: '<%= app.dist %>',
      flow: {
        html: {
          steps: {
            js: ['concat', 'uglifyjs'],
            css: ['cssmin']
          },
          post: {}
        }
      }
    }
  },

  // Performs rewrites based on filerev and the useminPrepare configuration
  usemin: {
    html: ['<%= app.dist %>/{,*/}*.html'],
    css: ['<%= app.dist %>/styles/{,*/}*.css'],
    js: ['<%= app.dist %>/scripts/{,*/}*.js'],
    options: {
      assetsDirs: [
        '<%= app.dist %>',
        '<%= app.dist %>/images',
        '<%= app.dist %>/styles'
      ],
      patterns: {
        js: [[/(images\/[^''""]*\.(png|jpg|jpeg|gif|webp|svg))/g, 'Replacing references to images']]
      }
    }
  },

  karma: {
    unit: {
      configFile: 'karma.conf.js',
      port: 9999,
      singleRun: true,
      browsers: ['PhantomJS'],
      logLevel: 'INFO'
    }
  }
};

module.exports = function (grunt) {
  gruntConfig.pkg = grunt.file.readJSON('package.json');

  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-htmlmin');
  grunt.loadNpmTasks('grunt-contrib-imagemin');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-filerev');
  grunt.loadNpmTasks('grunt-usemin');
  grunt.loadNpmTasks('grunt-wiredep');
  grunt.loadNpmTasks('grunt-karma');
  grunt.loadNpmTasks('grunt-angular-templates');
  grunt.loadNpmTasks('grunt-ng-annotate');
  grunt.loadNpmTasks('grunt-html-angular-validate');

  grunt.initConfig(gruntConfig);

  grunt.registerTask('build', [
    'clean',
    'wiredep',
    'useminPrepare',
    'copy:styles',
    'imagemin',
    'ngtemplates',
    'concat',
    'ngAnnotate',
    'copy:dist',
    'cssmin',
    'uglify',
    'filerev',
    'usemin',
    'htmlmin']);

  grunt.registerTask('lint', [
    'jshint',
    'htmlangular']);

  grunt.registerTask('default', ['lint','build']);
  grunt.registerTask('test', ['karma']);
  grunt.registerTask('all', ['lint','test','build']);

  return gruntConfig;
};
