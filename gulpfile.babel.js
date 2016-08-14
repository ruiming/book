import gulp from 'gulp'
import babel from 'gulp-babel'
import uglify from 'gulp-uglify'
import ngAnnotate from 'gulp-ng-annotate'
import concat from 'gulp-concat'
import cleanCSS from 'gulp-clean-css'
import imagemin from 'gulp-imagemin'
import minifyHtml from 'gulp-minify-html'
import ngTemplate from 'gulp-ng-template'
import plumber from 'gulp-plumber'
import sass from 'gulp-sass'
import qiniu from 'gulp-qiniu'
import usemin from 'gulp-usemin'
import eslint from 'gulp-eslint'

gulp.task('angular', function() {
    gulp.src([
            'bower_components/notie/dist/notie.min.js',
            'bower_components/angular-promise-buttons/dist/angular-promise-buttons.js',
            'bower_components/ngInfiniteScroll/build/ng-infinite-scroll.min.js'])
        .pipe(plumber())
        .pipe(ngAnnotate())
        .pipe(concat('dependence.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest('src/js/'))
});

gulp.task('js', function() {
    gulp.src(['app/**/*.js', 'app/module/**/*.js'])
        .pipe(plumber())
        .pipe(ngAnnotate())
        /*.pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failAfterError())*/
        .pipe(concat('app.js'))
        .pipe(babel())
        .pipe(gulp.dest('src/js/'))
});

gulp.task('templates', function() {
    gulp.src('app/module/**/*.html')
        .pipe(minifyHtml({empty: true, quotes: true}))
        .pipe(ngTemplate({
            moduleName: 'index',
            filePath: 'templates.js'
        }))
        .pipe(gulp.dest('src/js/'))
});

gulp.task('css', function() {
    gulp.src(['bower_components/notie/dist/notie.css'])
        .pipe(concat('app.min.css'))
        .pipe(cleanCSS())
        .pipe(gulp.dest('src/css/'))
});

gulp.task('fonts', function() {
    gulp.src(['bower_components/font-awesome/fonts/*', 'bower_components/bootstrap/fonts/*'])
        .pipe(gulp.dest('backend/app/static/fonts/'))
        .pipe(gulp.dest('src/fonts/'))
});

gulp.task('img', function() {
    gulp.src('static/images/*.*')
        .pipe(imagemin({
            progressive: true
        }))
        .pipe(gulp.dest('backend/app/static/images/'))
        .pipe(gulp.dest('src/images/'))
});

gulp.task('sass', function() {
    gulp.src(['app/*.scss', 'app/**/*.scss', 'app/module/**/*.scss'])
        .pipe(plumber())
        .pipe(concat('bookist.scss'))
        .pipe(sass())
        .pipe(cleanCSS())
        .pipe(gulp.dest('src/css/'))
});

gulp.task('cdn', function() {
    gulp.src('index.html')
        .pipe(usemin({
        }))
        .pipe(gulp.dest('backend/app/templates'));
    gulp.src(['./src/js/app.js', './src/js/dependence.min.js', './src/js/templates.js'])
        .pipe(plumber())
        .pipe(concat('app.min.js'))
        .pipe(uglify())
        .pipe(babel())
        .pipe(qiniu({
            accessKey: "rIku3cj75WrKEprUEf2YPDto8aPVDUe8iQ3Al2Q1",
            secretKey: "x5nPZqGt6lYBoKY1XVMEjY70VPCWRljmbaPtK4SJ",
            bucket: "bookist",
            private: false
        }));
    gulp.src(['./src/css/app.min.css', './src/css/bookist.css'])
        .pipe(concat('app.min.css'))
        .pipe(cleanCSS())
        .pipe(qiniu({
            accessKey: "rIku3cj75WrKEprUEf2YPDto8aPVDUe8iQ3Al2Q1",
            secretKey: "x5nPZqGt6lYBoKY1XVMEjY70VPCWRljmbaPtK4SJ",
            bucket: "bookist",
            private: false
        }));
});

gulp.watch(['app/*.scss', 'app/**/*.scss', 'app/module/**/*.scss'], ['sass']);
gulp.watch(['app/**/*.js', 'app/module/**/*.js'], ['js']);
gulp.watch('static/img/*.*', ['img']);
gulp.watch('app/module/**/*.html',['templates']);


gulp.task('product', ['cdn']);
gulp.task('default', ['css','js','angular','img','templates','sass','fonts']);
