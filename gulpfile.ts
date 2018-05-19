import gulp = require('gulp');
import {spawn} from 'child_process';
import {createProject} from 'gulp-typescript';
import * as sourceMaps from 'gulp-sourcemaps'

gulp.task(`pre-push`, [`test`]);

gulp.task(`test`, () => {
    return spawn(
        `nyc`,
        `--exclude build/** --require ts-node/register --reporter html --require ./tests/config/mocha-bootstrap.ts --extension .ts ./node_modules/mocha/bin/_mocha tests/**/**UnitTest.ts`.split(` `),
        {stdio: `inherit`})
        .on(`close`, (exitCode) => {
            process.exit(exitCode)
        });
});

gulp.task(`compile`, function () {
    const tsProject = createProject(`tsconfig.json`);

    return gulp.src(`source/**/*.ts`)
        .pipe(sourceMaps.init())
        .pipe(tsProject())
        .on(`error`, () => {
            process.exit(1)
        })
        .pipe(sourceMaps.write(`../maps`))
        .pipe(gulp.dest(`build/local`));
});