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
var usemin = require('gulp-usemin');
var rev = require('gulp-rev');
var runSequence  = require('gulp-run-sequence');

// 打包js依赖文件如angularJS文件和jquery等
// 该文件无需维护
gulp.task('angular', function(cb){
    gulp.src(['static/js/jquery.min.js',
            'static/js/angular.min.js',
            'static/js/angular-ui-router.min.js',
            'static/js/ui-bootstrap-tpls-1.2.4.min.js',
            'static/js/angular-animate.min.js',
            'static/js/angular-touch.min.js',
            'static/js/angular-sanitize.min.js',
            'static/js/ng-infinite-scroll.min.js'])
        .pipe(plumber())
        .pipe(ngAnnotate())
        .pipe(concat('dependence.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest('static/development/js/'))
        .on('end',cb);
});

// 打包压缩自己写的angular路由，控制器，指令文件
// 该文件需要维护，合并但不压缩
gulp.task('js', function(cb){
    gulp.src(['app/common/*.js','app/module/**/*.js'])
        .pipe(plumber())
        .pipe(ngAnnotate())
        .pipe(concat('app.js'))
        .pipe(gulp.dest('static/development/js/'))
        .on('end',cb);
});

// 打包视图
gulp.task('templates:dist', function(cb) {
    gulp.src('app/module/**/*.html')
        .pipe(minifyHtml({empty: true, quotes: true}))
        .pipe(ngTemplate({
            moduleName: 'index',
            filePath: 'templates.js'
        }))
        .pipe(gulp.dest('static/development/js/'))
        .on('end',cb);
});

// 打包合并css
gulp.task('css', function(cb){
    gulp.src(['static/css/*.css'])
        .pipe(concat('app.min.css'))
        .pipe(cleanCSS())
        .pipe(gulp.dest('static/development/css/'))
        .on('end',cb);
});

// 移动fonts
gulp.task('fonts', function(cb){
    gulp.src('static/fonts/*')
        .pipe(gulp.dest('backend/app/static/fonts/'))
        .pipe(gulp.dest('static/development/fonts/'))
        .on('end',cb);
});


// 压缩图片
gulp.task('img', function(cb){
    gulp.src('static/images/*.*')
        .pipe(imagemin({
            progressive: true
        }))
        .pipe(gulp.dest('backend/app/static/images/'))
        .pipe(gulp.dest('static/development/images/'))
        .on('end',cb);
});

// 编译sass得到bookist.css
gulp.task('sass', function(cb){
    gulp.src('static/scss/*.scss')
        .pipe(plumber())
        .pipe(sass())
        .pipe(cleanCSS())
        .pipe(gulp.dest('static/development/css/'))
        .on('end',cb);
});

// 部署生产环境，将全部css和js各合为一个
gulp.task('usemin', function(cb){
    gulp.src('index.html')
        .pipe(plumber())
        .pipe(usemin({
            cssProduct: ['concat'],
            jsProduct: ['concat',uglify()]
        }))
        .pipe(gulp.dest('backend/app/'))
        .on('end',cb);
});

// 移动index
gulp.task('move', function(){
    return gulp.src('backend/app/index.html')
                .pipe(gulp.dest('backend/app/templates/'));
});

gulp.watch('static/scss/*.scss',['sass']);
gulp.watch('static/css/*.css', ['css']);
gulp.watch('static/fonts/*.*', ['fonts']);
gulp.watch(['app/module/**/*.js', 'app/common/*.js'], ['js']);
gulp.watch('static/img/*.*', ['img']);
gulp.watch('app/module/**/*.html',['templates:dist']);
gulp.watch(['static/development/css/*.css', 'static/development/js/*.js', 'index.html'], ['usemin']);
gulp.watch('backend/app/index.html',['move']);

gulp.task('default', function(cb){
    runSequence(['css','js','angular','img','templates:dist','sass','fonts'],'usemin','move', cb);
});