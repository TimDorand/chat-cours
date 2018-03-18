"use strict";

let gulp = require("gulp");
let p = require("gulp-load-plugins")();
let del = require("del");
let sass = require('gulp-sass');
const production = !!p.util.env.production;

gulp.task("script", function () {
    return gulp.src("./views/assets/js/**/*.js")
        .pipe(p.concat("app.js"))
        .pipe(p.uglify())
        .pipe(gulp.dest("./views/dist/js"))
});

gulp.task("sass", function () {
    return gulp.src("./views/assets/scss/bulma.sass")
        //.pipe(p.sourcemaps.init())
        //.pipe(p.sass().on("error", p.sass.logError))
        //.pipe(p.sourcemaps.write())
        .pipe(sass().on('error', sass.logError))
        .pipe(p.if(production, p.cleanCss({compatibility: 'ie9'})))
        .pipe(gulp.dest("./views/dist/css"));
});

gulp.task("clean", function () {
    return del([
        './views/dist/js/*',
        './views/dist/css/*',
    ]);
});

gulp.task("watch", ["clean", "sass", "script"], function () {
    gulp.watch("./views/assets/scss/**/*.sass", ["sass"]);
    //gulp.watch("./views/assets/js/**/*.js", ["script"]);
});

gulp.task("default", ["clean", "sass"]);
