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
    gulp.src(['bower_components/jquery/dist/jquery.min.js',
            'bower_components/angular/angular.min.js',
            'bower_components/angular-ui-router/release/angular-ui-router.min.js',
            'bower_components/angular-bootstrap/ui-bootstrap-tpls.min.js',
            'bower_components/angular-animate/angular-animate.min.js',
            'bower_components/angular-touch/angular-touch.min.js',
            'bower_components/angular-sanitize/angular-sanitize.min.js',
            'bower_components/ngInfiniteScroll/build/ng-infinite-scroll.min.js'])
        .pipe(plumber())
        .pipe(ngAnnotate())
        .pipe(concat('dependence.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest('src/js/'))
        .on('end',cb);
});

// 打包压缩自己写的angular路由，控制器，指令文件
// 该文件需要维护，合并但不压缩
gulp.task('js', function(cb){
    gulp.src(['app/common/*.js','app/module/**/*.js'])
        .pipe(plumber())
        .pipe(ngAnnotate())
        .pipe(concat('app.js'))
        .pipe(gulp.dest('src/js/'))
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
        .pipe(gulp.dest('src/js/'))
        .on('end',cb);
});

// 打包合并css
gulp.task('css', function(cb){
    gulp.src(['bower_components/bootstrap/dist/css/bootstrap.min.css','bower_components/font-awesome/css/font-awesome.min.css'])
        .pipe(concat('app.min.css'))
        .pipe(cleanCSS())
        .pipe(gulp.dest('src/css/'))
        .on('end',cb);
});

// 移动fonts
gulp.task('fonts', function(cb){
    gulp.src(['bower_components/font-awesome/fonts/*', 'bower_components/bootstrap/fonts/*'])
        .pipe(gulp.dest('backend/app/static/fonts/'))
        .pipe(gulp.dest('src/fonts/'))
        .on('end',cb);
});


// 压缩图片
gulp.task('img', function(cb){
    gulp.src('static/images/*.*')
        .pipe(imagemin({
            progressive: true
        }))
        .pipe(gulp.dest('backend/app/static/images/'))
        .pipe(gulp.dest('src/images/'))
        .on('end',cb);
});

// 编译sass得到bookist.css
gulp.task('sass', function(cb){
    gulp.src('static/scss/*.scss')
        .pipe(plumber())
        .pipe(sass())
        .pipe(cleanCSS())
        .pipe(gulp.dest('src/css/'))
        .on('end',cb);
});

// 部署生产环境，将全部css和js各合为一个
gulp.task('together', function(cb){
    gulp.src('index.html')
        .pipe(plumber())
        .pipe(usemin({
            cssProduct: ['concat'],
            jsProduct: [ngAnnotate(),'concat',uglify()]
        }))
        .pipe(gulp.dest('backend/app/'))
        .on('end',cb);
});

// 移动index
gulp.task('move', function(){
    return gulp.src('backend/app/index.html')
                .pipe(gulp.dest('backend/app/templates/'));
});

gulp.watch('static/scss/*.scss',['sass']);                                      // sass自动部署
gulp.watch(['app/module/**/*.js', 'app/common/*.js'], ['js']);                  // angularJS自动部署
gulp.watch('static/img/*.*', ['img']);                                          // 图片自动部署
gulp.watch('app/module/**/*.html',['templates:dist']);                          // 模板自动部署

gulp.task('product',function(cb){                                               // 生产环境部署
    runSequence('together','move',cb)
});

gulp.task('default',['css','js','angular','img','templates:dist','sass','fonts']);