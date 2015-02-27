#!/usr/bin/env node
// -*- js -*-

var Pack = require('../lib/core');
var program = require('commander');
var pkg = require('../package.json');
var fs = require('fs');
var path = require('path');

// test_a
program
  .version(pkg.version)
  .parse(process.argv);



program.args.forEach(function (filePath) {
	var filestr = fs.readFileSync(filePath, {encoding: 'utf8'});
	var pack = new Pack();
	var newStr = pack.parseHtml(filestr, filePath);
	var dirname = path.dirname(filePath);
	var basename = path.basename(filePath);
	fs.writeFileSync(path.join(dirname, 'zip_' + basename), newStr, {encoding:'utf8'});

	pack.on('complete', function () {
		console.log('[Success]: 离线化完毕！');
	});
})