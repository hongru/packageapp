#!/usr/bin/env node
// -*- js -*-

var Pack = require('../lib/core');
var program = require('commander');
var pkg = require('../package.json');
var fs = require('fs');
var path = require('path');
var chalk = require('chalk');
var archiver = require('archiver');

// test_a
program
  .usage('[options] <htmlfile ...>')
  .version(pkg.version)
  .option('-p --prefix [string]', 'Prefix of dest file, if not assigned, source file will be rewrited')
  .option('-z --zip <path>', 'Dest Zip Path, default is process.cwd()')
  .parse(process.argv);

if (!program.prefix) program.prefix = '';
if (!program.zip) program.zip = path.join(process.cwd(), 'app.zip');
if (!/\.zip$/.test(program.zip)) program.zip = path.join(program.zip, 'app.zip');


var _done = 0;
var rootDir = process.cwd();
program.args.forEach(function (filePath, i) {
    if (i === 0) rootDir = path.dirname(filePath);

    var filestr = fs.readFileSync(filePath, {encoding: 'utf8'});
    var pack = new Pack();
    var newStr = pack.parseHtml(filestr, filePath);
    var dirname = path.dirname(filePath);
    var basename = path.basename(filePath);
    fs.writeFileSync(path.join(dirname, program.prefix + basename), newStr, {encoding:'utf8'});

    pack.on('complete', function () {
        console.log(chalk.green.bold('[Success]: ')+ chalk.cyan(filePath) + '及其依赖离线化完毕！');
        _done ++;
        if (_done == program.args.length) {
            makeZip(rootDir, program.zip);
        }
    });
});

function makeZip (root, zipPath) {

    var output = fs.createWriteStream(zipPath);
    var zipArchive = archiver('zip');

    output.on('close', function() {
        console.log(chalk.green.bold('[Success]: ')+ chalk.cyan(zipPath) + ' 打包完成!');
    });
    zipArchive.pipe(output);
    zipArchive.bulk([
        { src: [ '**/*' ], cwd: root, expand: true }
    ]);
    zipArchive.finalize(function(err, bytes) {
        if(err) {
          throw err;
        }
    });
}