/*
    the basic stuff.
*/        
var gulp    = require('gulp'),
    fs      = require('fs');
/*
    load all the other things.
*/        
var gulpLoadPlugins = require('gulp-load-plugins'),
$ = gulpLoadPlugins({pattern:'*', camelize:true,});

/*
    keep references to filenames up here.
*/        
var files = {
    "jsconf":   'src/js/allJS.conf',
    "jslib":    "all.min.js",
    "jsieconf": 'src/js/lteie8.conf',
    "jsielib":  "lteie8.min.js",
}

/*
    keep all the globs together here.
*/        
var glob = {
    "sass":     'src/sass/**/*.scss',
    "js":       'src/js/**/*.js',    
    "img":      'src/img/**/*.{jpg,jpeg,gif,png}',
    "svg":      'src/img/**/*.svg',
    "jekyll":   ['src/jekyll/**/*.{html,yml,md,mkd,markdown}','_config.yml'],
    "html":     'build/**/*.{html,yml,md,mkd,markdown,php}',
    "css":      '.tmp/*.css',
};

/*
    keeping all the destinations together here.
*/        
var dest = {
    "sass":      ".tmp",
    "css":      "build/css",
    "js":       "build/js",
    "img":      "build/img",
}

/*
    ----- SASS -----
*/        
gulp.task('sass',function()
{
    /*
        combine everything together so I can catch errors.
    */        
    var combined = $.streamCombiner(
        gulp.src(glob.sass),
        $.rubySass({
            style:'nested', // Can be nested, compact, compressed, expanded 
            loadPath:'bower_components', 
            quiet:true,
            sourcemap: "auto", 
            sourcemapPath: 'sass'
        }),        
        gulp.dest(dest.sass),
        gulp.dest(dest.css)
    );
    /*
        growl out any errors
    */        
    combined.on('error', function(err) 
    {
        $.util.log(err);   
        $.nodeNotifier.Growl().notify({
            name:       "SASS processor",
            title:      "SASS",
            message:    err.message,
        });
        this.emit('end');
    }); 
    return combined;       
});

/*
    Just adding that last sourcmap line back in (because autoprefixer removes it).
*/        
gulp.task('sourcemap',function()
{
    $.util.log('doing sourcemaps');   
    return gulp.src(glob.css)
        .pipe($.autoprefixer('last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'))
        .pipe($.footer('\n/*# sourceMappingURL=styles.css.map */\n'))
        .pipe($.browserSync.reload({stream:true}))
        .pipe(gulp.dest(dest.css))
});

/*
    ----- AUTO PREFIX -----
*/
gulp.task('autoprefix',function()
{
    return gulp.src(glob.css)
        .pipe($.autoprefixer('last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'))        
        .pipe(gulp.dest(dest.css))
        .pipe($.browserSync.reload({stream:true}));
});

/*
    ----- JEKYLL -----
*/
gulp.task('jekyll',$.shell.task('jekyll build'));

/*
    ----- JS LIBRARIES -----
    (minified into a single file)
*/
gulp.task('libScripts',function()
{
    createJSLib(files.jsconf,files.jslib);
    createJSLib(files.jsieconf,files.jsielib);
});

function createJSLib(conf,lib)
{
    var src = refreshJSLibs(conf);
    if (src.length)
    {
        $.util.log(src);   
        return gulp.src(src,{base:'bower_components/'})
            .pipe($.uglify())  
            .pipe($.header("/*! bower_components/${file.relative} */\n",{foo:'bar'}))
            .pipe($.concat(lib))
            .pipe(gulp.dest(dest.js))
            .pipe($.browserSync.reload({stream:true}));
    } else {
        $.util.log('file empty ignoring');
    }
}

/*
    Check lib size
*/        
gulp.task('checkScripts',function()
{
    var src = refreshJSLibs();
    if (src.length)
    {
        return gulp.src(src,{base:'bower_components/'})
            .pipe($.uglify())  
            .pipe($.header("/*! bower_components/${file.relative} */\n",{foo:'bar'}))
            .pipe($.gzip())
            .pipe($.flatten())
            .pipe($.filesize())
            .pipe(gulp.dest('.tmp'));
    } else {
        $.util.log('file empty ignoring');
    }
});

/*
    ----- JS FILES -----
    (for separates minified and copied across) 
*/
gulp.task('scripts',function()
{
    return gulp.src(glob.js)
        // .pipe($.uglify())  // put this back later - for dev I don't need it uglified.
        .pipe($.changed(dest.js))
        .pipe(gulp.dest(dest.js))
        .pipe($.browserSync.reload({stream:true}));
});

/*
    ----- SVG MINIFY -----
*/
gulp.task('svg',function()
{
    return gulp.src(glob.svg)
        .pipe($.changed(dest.img))
        .pipe($.svgmin([
                {removeHiddenElems:false},
                {mergePaths:false},
                {convertPathData:false},
            ]))
        .pipe(gulp.dest(dest.img))
        .pipe($.browserSync.reload({stream:true}));
});

/*
    ----- BITMAPS MINIFY -----
*/
gulp.task('bitmaps',function()
{
    return gulp.src(glob.img)
        .pipe($.changed(dest.img))
        .pipe($.imagemin())
        .pipe(gulp.dest(dest.img))
        .pipe($.browserSync.reload({stream:true}));
});

/*
    ----- SYNC -----
    (includes a server for flat builds)
*/
gulp.task('browser-sync', function() {
    $.browserSync.init(null, {
        open:false,
        // server: {baseDir: "./build/"},
        proxy: "pararchive.flats"
    });
});

/*
    ----- BASIC LIVERELOAD -----
    (so I can trigger it independantly for certain files)
*/
gulp.task('sync',function()
{
    return gulp.src(glob.html)
        .pipe($.cached('htmlsync'))
        .pipe($.browserSync.reload({stream:true}));
});

/*
    ----- WATCH -----
*/
gulp.task('watch', function() 
{ 
        // Watch .scss files
        gulp.watch(glob.sass, ['sass']);     
        gulp.watch(glob.css, ['sourcemap']); 

        // Watch .js files
        gulp.watch(glob.js, ['scripts']);

        // Watch JS library conf
        gulp.watch(files.jsconf, ['libScripts']); // and "checkScripts" ???
        gulp.watch(files.jsieconf, ['libScripts']); 

        // Watch bitmaps
        gulp.watch(glob.img, ['bitmaps']);

        // Watch SVG
        gulp.watch(glob.svg, ['svg']);

        // watch HTML (etc)
        // gulp.watch(glob.html,['sync']) 

        // Watch $.jekyll files
        gulp.watch(glob.jekyll, ['jekyll'])
});

/*
    ----- DEFAULT -----
*/
gulp.task('default', ['browser-sync','watch']);

function refreshJSLibs(confFile)
{
    var file = fs.readFileSync(confFile,'utf8').trim().split('\n');    
    var src = file.filter(function(v)
    {
        if (!v) return false;
        if (v.substr(0,1) == '#') return false;   

        if (!fs.existsSync(v)) 
        {
            $.util.log($.util.colors.red(v+' does not exist!'));
            return false;
        }
              
        return true;
    })    
    return src;
}
