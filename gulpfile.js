const gulp = require("gulp");
const autoprefixer = require("autoprefixer");
const babel = require("gulp-babel");
const browserSync = require("browser-sync");
const concat = require("gulp-concat");
const cssnano = require("cssnano");
const del = require("del");
const header = require("gulp-header");
const imagemin = require("gulp-imagemin");
const postcss = require("gulp-postcss");
const purgecss = require("gulp-purgecss");
const rev = require("gulp-rev");
const revRewrite = require("gulp-rev-rewrite");
const sass = require("gulp-sass");
const sourcemaps = require("gulp-sourcemaps");
const uglify = require("gulp-uglify");
sass.compiler = require("node-sass");

// Text located in a header of minified files
const headerText = ["/**", " * Sample eshop UI", " * @author Ondrej Kucera <ondrej@webista.cz>", " */\n"].join("\n");

// Paths
const paths = {
  data: {
    src: "./src/data.json"
  },
  html: {
    src: "src/*.html",
    dest: "dist/*.html"
  },
  styles: {
    scss: "src/scss/**/*.scss",
    scssMain: "src/scss/main.scss",
    css: "src/css/",
    dest: "dist/css/"
  },
  scripts: {
    src: "src/js/**/*.js",
    dest: "dist/js/"
  },
  images: {
    src: "src/img/**/*",
    dest: "dist/img/"
  }
};

// Local server with Browser sync
gulp.task("serve", () => {
  browserSync.init({
    server: "./src/"
  });
});

// Compile Sass into CSS
gulp.task("sass", () => {
  return gulp
    .src(paths.styles.scssMain)
    .pipe(sourcemaps.init())
    .pipe(sass().on("error", sass.logError))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(paths.styles.css))
    .pipe(browserSync.reload({ stream: true }));
});

// Watching .scss, .js, .html files
gulp.task("watch", () => {
  gulp.watch(paths.styles.scss, gulp.series("sass"));
  gulp.watch(paths.scripts.src).on("change", browserSync.reload);
  gulp.watch(paths.html.src).on("change", browserSync.reload);
});

// Minify CSS
gulp.task("min-css", () => {
  return gulp
    .src("src/css/main.css")
    .pipe(
      purgecss({
        content: [paths.html.src],
        // whitelist: ["is-active"],
        whitelistPatterns: [/is-/, /tns-/]
      })
    )
    .pipe(postcss([autoprefixer(), cssnano()]))
    .pipe(header(headerText))
    .pipe(gulp.dest(paths.styles.dest));
});

// Minify JS
gulp.task("min-js", () => {
  return (
    gulp
      .src("src/js/main.js")
      // .pipe(sourcemaps.init())
      .pipe(
        babel({
          presets: ["@babel/env"]
        })
      )
      .pipe(concat("main.js"))
      .pipe(uglify())
      // .pipe(sourcemaps.write())
      .pipe(header(headerText))
      .pipe(gulp.dest(paths.scripts.dest))
  );
});

// Compress images
gulp.task("min-img", () => {
  return gulp
    .src(paths.images.src)
    .pipe(
      imagemin([
        imagemin.gifsicle({ interlaced: true }),
        imagemin.mozjpeg({ quality: 75, progressive: true }),
        imagemin.optipng({ optimizationLevel: 5 }),
        imagemin.svgo({
          plugins: [{ removeViewBox: false }, { cleanupIDs: false }]
        })
      ])
    )
    .pipe(gulp.dest(paths.images.dest));
});

// Clean "dist" folder
gulp.task("clean", () => {
  return del(["dist/*.html", "dist/css", "dist/js"]);
});

// Copy .html files from "src" to "dest" folder
gulp.task("copy-html", () => {
  return gulp.src(paths.html.src).pipe(gulp.dest("dist/"));
});

// Revision
gulp.task("revision", () => {
  return gulp.src("dist/**/*.{css,js}").pipe(rev()).pipe(gulp.dest("dist/")).pipe(rev.manifest()).pipe(gulp.dest("dist/"));
});

const { readFileSync } = require("fs");

gulp.task("rewrite", () => {
  const manifest = readFileSync("dist/rev-manifest.json");
  return gulp.src("dist/**/*.html").pipe(revRewrite({ manifest })).pipe(gulp.dest("dist"));
});

gulp.task("default", gulp.parallel("serve", "watch"));
gulp.task("build", gulp.series("clean", "copy-html", "min-css", "min-js", "min-img", "revision", "rewrite"));
