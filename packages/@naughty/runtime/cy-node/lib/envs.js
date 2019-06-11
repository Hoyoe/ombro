"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
const yargs_1 = require("yargs");
const utils_1 = require("./utils");
exports.CUR_ROOT = path_1.join(__dirname, '..');
exports.USER_ROOT = process.cwd();
const DEFAULT_BABEL_CONFIG = path_1.join(exports.CUR_ROOT, 'babel.config.js');
exports.BABEL_CONFIG = utils_1.getBabelConfig({
    userRoot: exports.USER_ROOT,
    defaultConfig: DEFAULT_BABEL_CONFIG
});
exports.ENTRY = yargs_1.argv.entry || './src';
