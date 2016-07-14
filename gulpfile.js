var gulp = require('gulp'),
    $ = require('gulp-load-plugins')(),
    browserSync = require('browser-sync').create();

// for ES5
gulp.task('buildEs5', function(){
    return gulp.src('./src/simpleTable.js')
        .pipe($.size())
        .pipe($.plumber())
        .pipe(gulp.dest('./dist'))
        .pipe($.uglify())
        .pipe($.rename({ extname: '.min.js'}))
        .pipe(gulp.dest('./dist'))
        .pipe($.size())
        .pipe($.size({gzip: true}));
});

// for ES6
gulp.task('buildEs6', function () {
    return gulp.src('./src/es6/simpleTable.js')
        .pipe($.size())
        .pipe($.plumber())
        .pipe($.babel({
            presets: ['es2015']
        }))
        .pipe(gulp.dest('./dist/es6'))
        .pipe($.uglify())
        .pipe($.rename({ extname: '.min.js'}))
        .pipe(gulp.dest('./dist/es6'))
        .pipe($.size())
        .pipe($.size({gzip: true}));
});

gulp.task('serve', function() {
    browserSync.init({
        server: {
            baseDir: './'
        }
    });

    gulp.watch('./src/es6/*.js', ['buildEs6']);
    gulp.watch('./src/*.js', ['buildEs5']);
    gulp.watch(['./index.html', './src/*.js', './src/es6/*.js']).on('change', browserSync.reload);
});
