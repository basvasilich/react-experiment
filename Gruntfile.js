module.exports = function(grunt) {
    "use strict";

    require("load-grunt-tasks")(grunt);

    grunt.initConfig({
            clean: {
                all: [
                    'src/*.css',
                ]
            },
            watch: {
                jsx: {
                    files: [
                        'src/*.jsx',
                    ],
                    tasks: [ 'react', 'codestyle']
                },
                stylus: {
                    files: [
                        'src/*.styl'
                    ],
                    tasks: [ 'stylus', 'autoprefixer']
                }
            },
            react: {
                jsx: {
                    files: {
                        'src/spaceSwitcher.js': 'src/spaceSwitcher.jsx'
                    }
                }
            },
            jshint: {
                options: {
                    jshintrc: ".jshintrc",
                    force: true
                },
                files: [
                    "src/*.js"
                ]
            },
            stylus: {
                all: {
                    files: {
                        "src/spaceSwitcher.css": "src/spaceSwitcher.styl"
                    }
                }
            },
            autoprefixer: {
                single_file: {
                    options: {
                        browsers: ['last 2 version']
                    },
                    src: 'src/spaceSwitcher.css',
                    dest: 'src/spaceSwitcher-with-prefixes.css'
                }
            }
        }
    )

    grunt.registerTask("codestyle", [
        "jshint",
    ]);

    grunt.registerTask("test", [
        "codestyle",
        "jest"
    ]);

    grunt.registerTask('default', [
        'clean',
        'stylus',
        'react',
        'autoprefixer',
    ]);

    grunt.registerTask('server', [
        "codestyle",
        'stylus',
        'react',
        'autoprefixer',
        'watch'
    ]);
}