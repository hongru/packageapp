var assert = require('assert');
var Pack = require('../lib/core');
var fs = require('fs');

describe('parseHtml', function () {
    it('should return htmlstring with all url link replaced - testA.html', function () {
        var str = fs.readFileSync('./test/assets/testA.html', {encoding: 'utf8'});
        var output = fs.readFileSync('./test/assets/www/testA.html', {encoding: 'utf8'});
        var pack = new Pack();
        var newStr = pack.parseHtml(str, './test/assets/testA.html');
        assert.equal(output, newStr);
    });

});

describe('parseUriInCss', function () {
    it('should return cssstring with all url link replaced', function () {
        //var cssPath = './test/assets/che.css';
        var cssstr = '.test{background:url(http://g.tbcdn.cn/mtb/app-1111-constellation/1.0.3/images/bg_02.jpg)}';
        var pack = new Pack();
        var output = pack.parseUriInCss(cssstr, '');
        assert.equal('.test{background:url(images/mtb/app-1111-constellation/1.0.3/images/bg_02.jpg)}', output);
    })
})

describe('saveFile', function () {
    it('should save file successfully', function () {
        var pack = new Pack();
        pack.saveFile('http://g.tbcdn.cn/mtb/app-1111-constellation/1.0.3/images/bg_02.jpg');
        pack.on('complete', function () {
            //todo
        })
    })
});
