#!/usr/bin/env node
// -*- js -*-

var fs = require('fs'),
	fsutil = require('fsmore'),
	http = require('http'),
    util = require('util'),
    path = require('path'),
    url = require('url'),
    child_process = require('child_process'),
    spawn = child_process.spawn, 
	exec = child_process.exec,
    root_path = process.argv[1];

var cheerio = require('cheerio');
var uglify = require('uglify-js');
var less = require('less');
var archiver = require('archiver');
    
var VERSION = '0.0.0',
    ENCODE = 'utf8',
    PKG_CON,
    PWD = './';

var TEMP_DIR = 'pack_temp';
var IGNORE = ['.git', TEMP_DIR, 'node_modules', '.DS_Store'];
var debug = false;
var logAtEnd = [];

function _getVersion () {
    var pkgCon = _getPackageJson();
    if (pkgCon) {
        try {
            PKG_CON = JSON.parse(pkgCon);
        } catch (e) {
            util.print(e.message);
            process.exit(1);
        }
        
        VERSION = PKG_CON.version;
    }
    return VERSION;
}

function _getPackageJson() {
    var f1 = './package.json',
        f2 = '../package.json';
    if (fs.existsSync(f1)) {
        return fs.readFileSync(f1, ENCODE).toString();
    } else if (fs.existsSync(f2)) {
        return fs.readFileSync(f2, ENCODE).toString();
    }
}

function runCmds(dirname, cmds) {
	var opt = {
			cwd : dirname, 
			encoding : ENCODE
		},
		cmd;

	if (cmds.length) {
		cmd = cmds.shift();
		exec(cmd, opt, function(error, stdout, stderr) {
			stdout && util.log(stdout);
			(error || stderr) && util.error(error || stderr);
			runCmds(dirname, cmds);
		});

		util.debug(new Date().toTimeString().match(/\d{1,2}\:\d{1,2}\:\d{1,2}/g)[0] + 
					' - [run] ' + cmd + ' ');
	}
}

function main (args) {
    _getVersion();
    
    if (args && args instanceof Array){
        while (args.length > 0) {
            var v = args.shift();
            switch(v) {
                case '-v':
                case '--version':
                    util.print('version ' + VERSION + '\n');
                    process.exit(0);
                case '-d':
                case '--debug':
                	debug = true;
                default:
                    PWD = v;
                    break;
            }
        }
    }

    TEMP_DIR = path.join(PWD, TEMP_DIR);
    
    fs.existsSync(TEMP_DIR) && fsutil.rmdirSync(TEMP_DIR);
    fsutil.mkdirSync(TEMP_DIR);
    fsutil.rmdirSync(path.join(PWD, 'www.zip'));
    processAll();

}

function processAll () {
	var files = getAllFiles(PWD);
	var copyDone = 0;

	//console.log(files)

	files.forEach(function (file, i) {
		fsutil.copyFile(file, path.join(TEMP_DIR, file), function () { copyDone ++; __copyAll(); });
	});

	function __copyAll () {
		if (copyDone === files.length) {
			var tmpFiles = getAllFiles(path.join(PWD, TEMP_DIR));
			tmpFiles.forEach(function (file, i) {
				//console.log(file)
				var arr = file.split('.');
				var fileType = arr[arr.length-1];
				if (fileType === 'html') {
					processHtml(file);
				} else if (fileType === 'css') {
					processCss(file);
				}
			});
		}
	}
	
}

function processHtml (file) {
	var htmlCon = fs.readFileSync(file, ENCODE).toString();
	//console.log(htmlCon)
	var dirname = path.dirname(file);
	var $ = cheerio.load(htmlCon);
	var toProcessNum = 0;
	var processedNum = 0;

	//link,script,img
	$('link,script,img').each(function (i, el) { 
		var tagName = $(this).get(0).name;
		var href = tagName === 'link' ? $(this).attr('href') : $(this).attr('src');
		var $this = $(this);
		var dirNameHash = {
			link: 'css',
			script: 'js',
			img: 'images'
		};
		var hrefNameHash = {
			link: 'href',
			script: 'src',
			img: 'src'
		}

		if (/^http/i.test(href) && $(this).attr('keeplive') === undefined) {
			toProcessNum ++;

			//console.log(url.parse(href).pathname)
			var hrefname = url.parse(href).pathname;
			var hrefdir = path.dirname(hrefname);
			var filename = path.basename(href);
			var filetype = filename.split('.').pop();

			var destPath =  path.join(dirname, dirNameHash[tagName], hrefdir);
			//console.log(destPath, dirname, dirNameHash[tagName], hrefdir)
			var destFile = destPath + '/' + filename;

			fsutil.download(href, destFile, function (filename, dirname, destFile, tagName, href) {
				return function () {
					util.puts('>> "'+href+'" downloaded!');
					var relaPath = path.relative(dirname, destFile);
					$this.attr(hrefNameHash[tagName], relaPath);

					processedNum ++;
					__checkHtmlAllDone();
				}
			}(filename, dirname, destFile, tagName, href));
		}
	});
	
	function __checkHtmlAllDone () {
		if (processedNum === toProcessNum) {
			fs.writeFileSync(file, $.html());
			logAtEnd.push('>> SUCCESS: "'+file+'" 中所有script,link,img静态资源已完成离线文件下载和相对路径替换！');

			//待html中引用资源处理完全，css都在本地后处理css
			processCss(file, htmlCon, $);
		}
	}

}
function processCss (file, htmlCon, $) {
	//util.puts('========== css processing start ===========');
	
	var htmlDir = path.dirname(file);
	var cssFiles = $('link[rel=stylesheet]');
	var p = /url\s*\((\s*[A-Za-z0-9\-\_\.\/\:\"\']+\s*)\)\s*;?/gi;
	var toDownloadNum = 0;
	var downloadedNum = 0;

	cssFiles.each(function (i, el) {
		var $this = $(this);
		var fileHref = path.join(htmlDir, $this.attr('href'));
		var cssCon = fs.readFileSync(fileHref, ENCODE).toString();

		//console.log(cssCon)
		// download && replace
		var newCssCon = cssCon.replace(p, function (a, b) {
			if (/^http/.test(b)) {
				var destFile = path.join(htmlDir, 'images/', url.parse(b).pathname);
				toDownloadNum ++;
				fsutil.download(b, destFile, function (destFile) {
					return function () {
						util.puts('>> "'+ b + '" downloaded!');
						downloadedNum ++;
						__checkCssAll();
					}
					
				}(destFile));
				var relaPath = path.relative(path.dirname(fileHref), destFile);
				return 'url('+ relaPath +')';
			}
			return a;
		});

		//console.log(fileHref);
		fs.writeFileSync(fileHref, newCssCon);
		logAtEnd.push('>> SUCCESS: "'+fileHref+'" 中所有静态资源已完成离线文件下载和相对路径替换！');
	});

	function __checkCssAll () {
		if (downloadedNum === toDownloadNum) {
			packZip();
			logAtEnd.forEach(function (log) {
				util.puts(log);
			})
		}
	}
}

function packZip () {
	var srcDirectory = path.join(PWD, TEMP_DIR);
	var outputPath = path.join(PWD, 'www.zip');

	fsutil.rmdirSync(outputPath);

	var output = fs.createWriteStream(outputPath);
	var zipArchive = archiver('zip');

	output.on('close', function() {
	    //console.log('done with the zip', outputPath);
	    util.puts('>> "'+ outputPath + '" 打包完成! 大小为' + fsutil.getFilesizeInBytes(outputPath)/1000 + 'K');
	    //console.log(debug)
	    if (!debug) fsutil.rmdirSync(TEMP_DIR);
	});

	zipArchive.pipe(output);

	zipArchive.bulk([
	    { src: [ '**/*' ], cwd: srcDirectory, expand: true }
	]);

	zipArchive.finalize(function(err, bytes) {

	    if(err) {
	      throw err;
	    }

	    //console.log('done:', base, bytes);

	});
}

function isIgnore (name) {
	for (var i = 0; i < IGNORE.length; i ++) {
		if (name.indexOf(IGNORE[i]) > -1 ) {
			return true;
		}
	}
	return false;
}

function getAllFiles(root) { 
	var files = fs.readdirSync(root);
	var res = [];
	files.forEach(function (file, i) {

		var pathname = root.replace(/\/$/, '') + '/' + file;
		var stat = fs.lstatSync(pathname);

		if (!stat.isDirectory()) {
			//file
			!isIgnore(file) && res.push(pathname);
		} else {
			//dir
			if (!isIgnore(file + '/')) {
				res = res.concat(getAllFiles(pathname));
			}
		}
	});
	return res;
}

//exports
if (require.main === module) {
    main(process.argv.slice(2));
} else {
    module.exports = main;
}
