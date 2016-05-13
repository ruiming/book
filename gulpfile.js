var gulp = require('gulp');
var uglify = require('gulp-uglify');
var ngAnnotate = require('gulp-ng-annotate');
var concat = require('gulp-concat');
var cleanCSS = require('gulp-clean-css');
var imagemin = require('gulp-imagemin');
var minifyHtml = require('gulp-minify-html');
var ngTemplate = require('gulp-ng-template');
var plumber = require('gulp-plumber');
var sass = require('gulp-sass');

// 打包js依赖文件如angularJS文件和jquery等
gulp.task('angular', function(){

    gulp.src(['static/js/jquery.min.js',
            'static/js/angular.min.js',
            'static/js/angular-ui-router.min.js',
            'static/js/ui-bootstrap-tpls-1.2.4.min.js',
            'static/js/angular-animate.min.js',
            'static/js/angular-touch.min.js',
            'static/js/ng-infinite-scroll.min.js'])
        .pipe(plumber())
        .pipe(ngAnnotate())
        .pipe(concat('dependence.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest('backend/app/static/js/'))

});

// 打包压缩自己写的angular路由，控制器，指令文件
gulp.task('js', function(){

    gulp.src(['app/common/*.js','app/module/**/*.js'])
        .pipe(plumber())
        .pipe(ngAnnotate())
        .pipe(concat('app.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest('backend/app/static/js/'));

});

// 打包视图
gulp.task('templates:dist', function() {
    gulp.src('app/module/**/*.html')
        .pipe(minifyHtml({empty: true, quotes: true}))
        .pipe(ngTemplate({
            moduleName: 'index',
            filePath: 'templates.js'
        }))
        .pipe(gulp.dest('backend/app/static/js/'));
});

// 打包合并css和fonts
gulp.task('css', function(){
    
    gulp.src(['static/css/*.css'])
        .pipe(concat('app.min.css'))
        .pipe(cleanCSS())
        .pipe(gulp.dest('backend/app/static/css/'));

    gulp.src('static/fonts/*')
        .pipe(gulp.dest('backend/app/static/fonts/'));

});

// 压缩图片
gulp.task('img', function(){
    
    gulp.src('static/images/*.*')
        .pipe(imagemin({
            progressive: true
        }))
        .pipe(gulp.dest('backend/app/static/images/'))
});

// 编译sass
gulp.task('sass', function(){

    gulp.src('static/scss/*.scss')
        .pipe(plumber())
        .pipe(sass())
        .pipe(cleanCSS())
        .pipe(gulp.dest('backend/app/static/css/'))

});


gulp.watch('static/scss/*.scss',['sass']);
gulp.watch('static/css/*.css', ['css']);
gulp.watch(['app/module/**/*.js', 'app/common/*.js'], ['js']);
gulp.watch('static/img/*.*', ['img']);
gulp.watch('app/module/**/*.html',['templates:dist']);

gulp.task('default', ['css','js','angular','img','templates:dist','sass']);
