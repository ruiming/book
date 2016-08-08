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
import usemin from 'gulp-usemin'
import runSequence from 'gulp-run-sequence'
import eslint from 'gulp-eslint'

gulp.task('angular', function(cb){
    gulp.src(['bower_components/jquery/dist/jquery.min.js',
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
        .pipe(concat('dependence.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest('src/js/'))
        .on('end',cb);
});

gulp.task('js', function(cb){
    gulp.src(['app/**/*.js', 'app/module/**/*.js'])
        .pipe(plumber())
        .pipe(ngAnnotate())
        /*.pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failAfterError())*/
        .pipe(concat('app.js'))
        .pipe(babel())
        .pipe(uglify())
        .pipe(gulp.dest('src/js/'))
        .on('end',cb);
});

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

gulp.task('css', function(cb){
    gulp.src(['bower_components/bootstrap/dist/css/bootstrap.min.css',
            'bower_components/font-awesome/css/font-awesome.min.css',
            'bower_components/notie/dist/notie.css'])
        .pipe(concat('app.min.css'))
        .pipe(cleanCSS())
        .pipe(gulp.dest('src/css/'))
        .on('end',cb);
});

gulp.task('fonts', function(cb){
    gulp.src(['bower_components/font-awesome/fonts/*', 'bower_components/bootstrap/fonts/*'])
        .pipe(gulp.dest('backend/app/static/fonts/'))
        .pipe(gulp.dest('src/fonts/'))
        .on('end',cb);
});

gulp.task('img', function(cb){
    gulp.src('static/images/*.*')
        .pipe(imagemin({
            progressive: true
        }))
        .pipe(gulp.dest('backend/app/static/images/'))
        .pipe(gulp.dest('src/images/'))
        .on('end',cb);
});

gulp.task('sass', function(cb){
    gulp.src(['app/*.scss', 'app/**/*.scss', 'app/module/**/*.scss'])
        .pipe(plumber())
        .pipe(concat('bookist.scss'))
        .pipe(sass())
        .pipe(cleanCSS())
        .pipe(gulp.dest('src/css/'))
        .on('end',cb);
});

gulp.task('together', function(cb){
    gulp.src('index.html')
        .pipe(plumber())
        .pipe(usemin({
            cssProduct: ['concat'],
            jsProduct: [uglify(), babel()]
        }))
        .pipe(gulp.dest('backend/app/'))
        .on('end',cb);
});

gulp.task('move', function(){
    return gulp.src('backend/app/index.html')
                .pipe(gulp.dest('backend/app/templates/'));
});

gulp.watch(['app/*.scss', 'app/**/*.scss', 'app/module/**/*.scss'], ['sass']);
gulp.watch(['app/**/*.js', 'app/module/**/*.js'], ['js']);
gulp.watch('static/img/*.*', ['img']);
gulp.watch('app/module/**/*.html',['templates:dist']);

gulp.task('product',function(cb) {
    runSequence('together','move',cb)
});

gulp.task('default',['css','js','angular','img','templates:dist','sass','fonts']);
