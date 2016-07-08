var gulp = require('gulp'),
    uglify = require('gulp-uglify')
    rename = require('gulp-rename');

gulp.task('uglifyjs', function(){
    return gulp.src('./src/simpleTable.js')
        .pipe(uglify())
        .pipe(rename(function (path) {
            path.basename += '.min';
        }))
        .pipe(gulp.dest('./dist'));
});

gukp.task('rename', function(){
    return gulp.src('./dist/')
});
