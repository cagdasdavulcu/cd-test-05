// Copyright (c) Wictor Wilén. All rights reserved. 
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.

var gulp = require('gulp');
var vinyl = require('vinyl');
var webpack = require('webpack');
var inject = require('gulp-inject');
const zip = require('gulp-zip');
var nodemon = require('nodemon');
var argv = require('yargs').argv;
var PluginError = require('plugin-error');
var log = require('fancy-log');
var fs = require('fs');
var ZSchema = require('z-schema');
var request = require('request');
var path = require('path');
const del = require('del'); // rm -rf
const replace = require('gulp-token-replace');


var injectSources = ["./dist/web/scripts/**/*.js", './dist/web/assets/**/*.css']
var staticFiles = ["./src/app/**/*.html", "./src/app/**/*.ejs", "./src/app/web/assets/**/*"]
var htmlFiles = ["./src/app/**/*.html", "./src/app/**/*.ejs"]
var watcherfiles = ["./src/**/*.*"]
var manifestFiles = ["./src/manifest/**/*.*", '!**/*.json']
var temp = ["./temp"]

/**
 * Supported schemas
 */
const SCHEMAS = [
    {
        version: "1.3",
        schema: "https://developer.microsoft.com/en-us/json-schemas/teams/v1.3/MicrosoftTeams.schema.json"
    },
    {
        version: "devPreview",
        schema: "https://raw.githubusercontent.com/OfficeDev/microsoft-teams-app-schema/preview/DevPreview/MicrosoftTeams.schema.json"
    }
];

/**
 * Watches source files and invokes the build task
 */
gulp.task('watch', () => {
    gulp.watch(watcherfiles, gulp.series('build'));
});

// TASK: nuke
gulp.task('nuke', () => {
    return del(['temp', 'package', 'dist']);
});

/**
 * Webpack bundling
 */
gulp.task('webpack', (callback) => {
    var webpackConfig = require(process.cwd() + '/webpack.config')
    webpack(webpackConfig, function (err, stats) {
        if (err) throw new PluginError("webpack", err);

        var jsonStats = stats.toJson();
        if (jsonStats.errors.length > 0) {
            jsonStats.errors.map(function (e) {
                log('[Webpack error] ' + e);
            });
            throw new PluginError("webpack", "Webpack errors, see log");
        }
        if (jsonStats.warnings.length > 0) {
            jsonStats.warnings.map(function (e) {
                log('[Webpack warning] ' + e);
            });
        }
        callback();
    });
});

/**
 * Copies static files
 */
gulp.task('static:copy', () => {
    return gulp.src(staticFiles, {
        base: "./src/app"
    })
        .pipe(gulp.dest('./dist/'));
});

/**
 * Injects script into pages
 */
gulp.task('static:inject', () => {
    var injectSrc = gulp.src(injectSources);

    var injectOptions = {
        relative: false,
        ignorePath: 'dist/web',
        addRootSlash: true
    };
    require('dotenv').config();
    return gulp.src(htmlFiles)
        .pipe(replace({ tokens: { ...process.env } }))
        .pipe(inject(injectSrc, injectOptions)) // inserts custom sources
        .pipe(gulp.dest('./dist'));
});

/**
 * Build task, that uses webpack and injects scripts into pages
 */
gulp.task('build', gulp.series('webpack', 'static:copy', 'static:inject'));

/**
 * Replace parameters in the manifest
 */
gulp.task('generate-manifest', (cb) => {
    require('dotenv').config();
    return gulp.src('src/manifest/manifest.json')
        .pipe(replace({ tokens: { ...process.env } }))
        .pipe(gulp.dest(temp));
});

/**
 * Schema validation
 */
gulp.task('schema-validation', (callback) => {

    var filePath = path.join(__dirname, 'temp/manifest.json');
    fs.readFile(filePath, {
        encoding: 'utf-8'
    }, function (err, data) {
        if (!err) {
            var json = JSON.parse(data);
            log('Using manifest schema ' + json.manifestVersion);
            let definition = SCHEMAS.find(s => s.version == json.manifestVersion);
            if (definition == undefined) {
                callback(new PluginError("validate-manifest", "Unable to locate schema"));
                return;
            }
            if (json["$schema"] != definition.schema) {
                log("Note: the defined schema in your manifest does not correspond to the manifestVersion");
            }
            var requiredUrl = definition.schema;
            var validator = new ZSchema();

            var schema = {
                "$ref": requiredUrl
            };
            request(requiredUrl, {
                gzip: true
            }, (err, res, body) => {
                validator.setRemoteReference(requiredUrl, JSON.parse(body));

                var valid = validator.validate(json, schema);
                var errors = validator.getLastErrors();
                if (!valid) {
                    callback(new PluginError("validate-manifest", errors.map((e) => {
                        return e.message;
                    }).join('\n')));
                } else {
                    callback();
                }
            })

        } else {
            callback(PluginError("validate-manifest", err));
        }
    });
});

gulp.task('validate-manifest', gulp.series('generate-manifest', 'schema-validation'));


/**
 * Task for local debugging
 */
gulp.task('nodemon', (cb) => {
    var started = false;
    var debug = argv.debug !== undefined;

    return nodemon({
        script: 'dist/server.js',
        watch: ['dist/server.js'],
        nodeArgs: debug ? ['--debug'] : []
    }).on('start', function () {
        if (!started) {
            cb();
            started = true;
        }
    });
});


gulp.task('serve', gulp.series('build', 'nodemon', 'watch'));

/**
 * Creates the tab manifest
 */
gulp.task('zip', () => {
    return gulp.src(manifestFiles)
        .pipe(gulp.src('./temp/manifest.json'))
        .pipe(zip('cd-test-05.zip'))
        .pipe(gulp.dest('package'));
});

gulp.task('manifest', gulp.series('nuke', 'validate-manifest', 'zip'));
