const gulp = require("gulp");
const autoprefixer = require("autoprefixer");
const babel = require("gulp-babel");
const browserSync = require("browser-sync");
const concat = require("gulp-concat");
const cssnano = require("cssnano");
const del = require("del");
const header = require("gulp-header");
const postcss = require("gulp-postcss");
const purgecss = require("gulp-purgecss");
const rev = require("gulp-rev");
const revRewrite = require("gulp-rev-rewrite");
const sass = require("gulp-sass");
const sourcemaps = require("gulp-sourcemaps");
const uglify = require("gulp-uglify");
sass.compiler = require("node-sass");

// Text located in a header of minified files
const headerText = ["/**", " * Bikes", " * @author Ondrej Kucera <ondrej@webista.cz>", " */\n"].join("\n");

// Paths
const paths = {
  html: {
    src: "src/*.html",
    dest: "build/*.html"
  },
  styles: {
    scss: "src/scss/**/*.scss",
    scssMain: "src/scss/main.scss",
    css: "src/css/",
    dest: "build/css/"
  },
  scripts: {
    src: "src/js/**/*.js",
    dest: "build/js/"
  },
  images: {
    src: "src/img/**/*",
    dest: "build/img/"
  }
};

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

// Local server with Browser sync
gulp.task("serve", () => {
  browserSync.init({
    server: "./"
  });
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
        whitelistPatterns: [/is-/]
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
      .src(paths.scripts.src)
      // .src(["src/js/lazyLoad.js", "src/js/tooltip.js", "src/js/main.js"])
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

// Clean "build" folder
gulp.task("clean", () => {
  return del(["build/*.html", "build/css", "build/js"]);
});

// Copy .html files from "src" to "dest" folder
gulp.task("copy-html", () => {
  return gulp.src(paths.html.src).pipe(gulp.dest("build/"));
});

// Revision
gulp.task("revision", () => {
  return gulp.src("build/**/*.{css,js}").pipe(rev()).pipe(gulp.dest("build/")).pipe(rev.manifest()).pipe(gulp.dest("build/"));
});

const { readFileSync } = require("fs");

gulp.task("rewrite", () => {
  const manifest = readFileSync("build/rev-manifest.json");
  return gulp.src("build/**/*.html").pipe(revRewrite({ manifest })).pipe(gulp.dest("build"));
});

gulp.task("default", gulp.parallel("serve", "watch"));
gulp.task("build", gulp.series("clean", "copy-html", "min-css", "min-js", "revision", "rewrite"));
