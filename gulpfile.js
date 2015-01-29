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

var build = 'build/flats';

/*
    keep all the globs together here.
*/        
var glob = {
    "sass":     'src/sass/**/*.scss',
    "js":       'src/js/**/*.js',    
    "img":      'src/img/**/*.{jpg,jpeg,gif,png}',
    "svg":      'src/img/**/*.svg',
    "jekyll":   ['src/jekyll/**/*.{html,yml,md,mkd,markdown}','_config.yml'],
    "html":     build+'/**/*.{html,yml,md,mkd,markdown,php}',
    "css":      '.tmp/*.css',
};

/*
    keeping all the destinations together here.
*/        
var dest = {
    "sass":      ".tmp",
    "css":      build+"/css",
    "js":       build+"/js",
    "img":      build+"/img",
}

/*
    - - - - - - - - - - - - - - - - - - - - - - - START OF TASKS - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
*/       

/*
    ----- SASS -----
*/        
gulp.task('sass',function()
{
    var cssFilter = $.filter('*.css');
    /*
        combine everything together so I can catch errors.
    */        
    var combined = $.streamCombiner(
        gulp.src(glob.sass),
        $.rubySass({
            style:'compressed', // Can be nested, compact, compressed, expanded 
            loadPath:'bower_components', 
            quiet:true,
            sourcemap: "auto", 
            sourcemapPath: 'sass'
        }),
        cssFilter,
        $.autoprefixer('last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'),
        $.footer('/*# sourceMappingURL=styles.css.map */\n'),
        cssFilter.restore(),
        $.browserSync.reload({stream:true}),
        gulp.dest(dest.css) // this makes sure the sourcemap gets to the live CSS fodler.
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
    ----- JEKYLL -----
    (Runs Jekyll as a shell command)
*/
gulp.task('jekyll', $.shell.task(['jekyll build']) );

/*
    ----- JS LIBRARIES -----
    (Minified into a single file)
*/
gulp.task('libScripts',function()
{
    var createJSLib = function(conf,lib)
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

    createJSLib(files.jsconf,files.jslib);
    createJSLib(files.jsieconf,files.jsielib);
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
    ----- BROWSER SYNC TASK  -----
    (so I can trigger it independantly for certain files)
*/
gulp.task('sync',function()
{
    return gulp.src(glob.html)
        .pipe($.cached('htmlsync'))
        .pipe($.browserSync.reload({stream:true}));
});

gulp.task('scss-lint',function() 
{
    gulp.src(glob.sass)
        .pipe($.scssLint());
});

/*
    - - - - - - - - - - - - - - - - - - - - - - - END OF TASKS - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
*/        

/*
    ----- BROWSER SYNC SERVER -----
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
    ----- WATCH -----
*/
gulp.task('watch', function() 
{ 
        // Watch .scss files
        gulp.watch(glob.sass, ['sass']);     
        gulp.watch(glob.css, ['autoprefix']); 

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
        gulp.watch(glob.html,['sync']) 

        // Watch $.jekyll files
        gulp.watch(glob.jekyll, ['jekyll'])
});

/*
    ----- DEFAULT -----
*/
gulp.task('default', ['browser-sync','watch']);

/*
    JAVASCRIPT SIZES
    (A task to determine how mch javascript there is and which libraries are to blame)
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
    Quick function to grab the conf files and check through it's contents.
*/        
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