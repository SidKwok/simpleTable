var gulp = require('gulp'),
    uglify = require('gulp-uglify')
    rename = require('gulp-rename');

gulp.task('build', function(){
    return gulp.src('./src/simpleTable.js')
        .pipe(gulp.dest('./dist'))
        .pipe(uglify())
        .pipe(rename({ extname: '.min.js'}))
        .pipe(gulp.dest('./dist'));
});
