#!/usr/bin/env node
// -*- js -*-

var Pack = require('../lib/core');
var program = require('commander');
var pkg = require('../package.json');
var fs = require('fs-extra');
var path = require('path');
var chalk = require('chalk');
var archiver = require('archiver');
var request = require('request');

var zip_dir = 'www';

// test_a
program
  .usage('[options] <htmlfile ...>')
  .version(pkg.version)
  .option('-p --prefix [string]', 'Prefix of dest file')
  .option('-z --zip <path>', 'Dest Zip Path, default is process.cwd()')
  .parse(process.argv);

if (!program.prefix) program.prefix = '';
if (!program.zip) program.zip = path.join(process.cwd(), 'app.zip');
if (!/\.zip$/.test(program.zip)) program.zip = path.join(program.zip, 'app.zip');


var _done = 0;
var rootDir = process.cwd();

copyProject();

program.args.forEach(function (filePath, i) {
    if (/^(\s+)?(http(s)?\:)?\/\//.test(filePath)) {
        //线上url
        var destPath = path.join(rootDir, 'index.html');
        request(filePath)
        .on('end', function () {
            processFile(destPath);
        }).pipe(fs.createWriteStream(destPath));
    } else {
        processFile(path.join(zip_dir, filePath));
    }
});

function copyProject () {
    //将所有项目文件拷贝一份到项目根目录的www文件夹下面
    var tempDest = path.join(rootDir, '..', zip_dir);
    fs.copySync(rootDir, tempDest);
    var gitignore = path.join(rootDir, '.gitignore');
    if (fs.existsSync(gitignore)) {
        var ig = fs.readFileSync(gitignore, {encoding:'utf8'});
        ig = ig.split('\n');
        ig.forEach(function (s) {
            if (s) {
                fs.removeSync(path.join(tempDest, s));
            }
            fs.removeSync(path.join(tempDest, '.git/'));
        })
    }
    // copy 至根目录
    fs.copySync(tempDest, path.join(rootDir, zip_dir));
    fs.removeSync(tempDest);
}


function processFile (filePath) {
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
}

function makeZip (root, zipPath) {

    var output = fs.createWriteStream(zipPath);
    var zipArchive = archiver('zip');

    output.on('close', function() {
        console.log(chalk.green.bold('[Success]: ')+ chalk.cyan(zipPath) + ' 打包完成!');
    });
    zipArchive.pipe(output);
    zipArchive.bulk([
        { src: [ '**/*' ], cwd: path.join(root, zip_dir), expand: true }
    ]);
    zipArchive.finalize(function(err, bytes) {
        if(err) {
          throw err;
        }
    });
}