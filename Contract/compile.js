const sh = require('shelljs')
const path = require('path')

sh.cd(__dirname);

const buildCmd = 'cargo build --target wasm32-unknown-unknown --release';
const { code } = sh.exec(buildCmd)

process.exit(code)
