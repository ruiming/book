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

// 打包js依赖
gulp.task('angular', function() {
    gulp.src([
        'node_modules/babel-polyfill/dist/polyfill.min.js',
        'bower_components/notie/dist/notie.min.js',
        'bower_components/angular/angular.min.js',
        'bower_components/angular-ui-router/release/angular-ui-router.min.js',
        'bower_components/angular-bootstrap/ui-bootstrap-tpls.min.js',
        'bower_components/angular-animate/angular-animate.min.js',
        'bower_components/angular-touch/angular-touch.min.js',
        'bower_components/angular-sanitize/angular-sanitize.min.js',
        'bower_components/angular-promise-buttons/dist/angular-promise-buttons.js',
        'bower_components/ngInfiniteScroll/build/ng-infinite-scroll.min.js'])
        .pipe(plumber())
        .pipe(ngAnnotate())
        .pipe(concat('app.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest('src/js/'))
});

// 打包css依赖
gulp.task('css', function() {
    gulp.src(['bower_components/bootstrap/dist/css/bootstrap.min.css',
        'bower_components/font-awesome/css/font-awesome.min.css',
        'bower_components/notie/dist/notie.css'])
        .pipe(concat('app.min.css'))
        .pipe(cleanCSS())
        .pipe(gulp.dest('src/css/'))
});

gulp.task('font', function() {
    gulp.src('static/fonts/**.*')
        .pipe(gulp.dest('src/fonts/'))
});

// 自己的js代码
gulp.task('js', function() {
    gulp.src(['app/**/*.js', 'app/module/**/*.js'])
        .pipe(plumber())
        .pipe(ngAnnotate())
        /*.pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failAfterError())*/
        .pipe(concat('bookist.js'))
        .pipe(babel())
        .pipe(gulp.dest('src/js/'))
});

// 模板处理
gulp.task('templates', function() {
    gulp.src('app/module/**/*.html')
        .pipe(minifyHtml({empty: true, quotes: true}))
        .pipe(ngTemplate({
            moduleName: 'index',
            filePath: 'templates.js'
        }))
        .pipe(uglify())
        .pipe(gulp.dest('src/js/'))
});

// 图片压缩
gulp.task('img', function() {
    gulp.src('static/images/*.*')
        .pipe(imagemin({
            progressive: true
        }))
        .pipe(gulp.dest('backend/app/static/images/'))
        .pipe(gulp.dest('src/images/'))
});

// sass编译
gulp.task('sass', function() {
    gulp.src(['app/*.scss', 'app/**/*.scss', 'app/module/**/*.scss'])
        .pipe(plumber())
        .pipe(concat('bookist.min.scss'))
        .pipe(sass())
        .pipe(cleanCSS())
        .pipe(gulp.dest('src/css/'))
});

// 发布CDN
gulp.task('cdn', function() {
    // 变动资源
    gulp.src(['./src/js/bookist.js', './src/js/templates.js'])
        .pipe(plumber())
        .pipe(uglify())
        .pipe(babel())
        .pipe(concat('bookist.min.js'))
        .pipe(qiniu({
            accessKey: "rIku3cj75WrKEprUEf2YPDto8aPVDUe8iQ3Al2Q1",
            secretKey: "x5nPZqGt6lYBoKY1XVMEjY70VPCWRljmbaPtK4SJ",
            bucket: "bookist",
            private: false
        }));
    gulp.src('src/css/bookist.min.css')
        .pipe(cleanCSS())
        .pipe(qiniu({
            accessKey: "rIku3cj75WrKEprUEf2YPDto8aPVDUe8iQ3Al2Q1",
            secretKey: "x5nPZqGt6lYBoKY1XVMEjY70VPCWRljmbaPtK4SJ",
            bucket: "bookist",
            private: false
        }));
    // 长期缓存资源
    gulp.src('index.html')
        .pipe(usemin())
        .pipe(gulp.dest('backend/app/templates'));
    gulp.src('src/js/app.min.js')
        .pipe(plumber())
        .pipe(uglify())
        .pipe(qiniu({
            accessKey: "rIku3cj75WrKEprUEf2YPDto8aPVDUe8iQ3Al2Q1",
            secretKey: "x5nPZqGt6lYBoKY1XVMEjY70VPCWRljmbaPtK4SJ",
            bucket: "bookist",
            private: false
        }));
    gulp.src('src/css/app.min.css')
        .pipe(cleanCSS())
        .pipe(qiniu({
            accessKey: "rIku3cj75WrKEprUEf2YPDto8aPVDUe8iQ3Al2Q1",
            secretKey: "x5nPZqGt6lYBoKY1XVMEjY70VPCWRljmbaPtK4SJ",
            bucket: "bookist",
            private: false
        }));
    gulp.src('src/fonts/**.*')
        .pipe(qiniu({
            accessKey: "rIku3cj75WrKEprUEf2YPDto8aPVDUe8iQ3Al2Q1",
            secretKey: "x5nPZqGt6lYBoKY1XVMEjY70VPCWRljmbaPtK4SJ",
            bucket: "bookist",
            private: false
        }, {
            dir: 'fonts/',
        }));
});

gulp.watch(['app/*.scss', 'app/**/*.scss', 'app/module/**/*.scss'], ['sass']);
gulp.watch(['app/**/*.js', 'app/module/**/*.js'], ['js']);
gulp.watch('static/img/*.*', ['img']);
gulp.watch('app/module/**/*.html',['templates']);


gulp.task('product', ['cdn']);
gulp.task('default', ['js', 'css', 'font', 'angular','img','templates','sass']);
