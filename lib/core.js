var cheerio = require('cheerio');
var path = require('path');
var fs = require('fs-extra');
var url = require('url');
var http = require('http');
var request = require('request');

var zipdir = {
    js: 'zip_js',
    css: 'zip_css',
    img: 'zip_images'
};
var reg_http = /^(\s+)?(http(s)?\:)?\/\//;
var reg_cssurl = /url\s*\((\s*[A-Za-z0-9\-\_\.\/\:\"\']+\s*)\)\s*;?/gi;

// util funcs
function mkZipDirs (htmlPath) {
    var ret = {};
    var basedir = path.dirname(htmlPath);
    for (var k in zipdir) {
        var dir = path.join(basedir, zipdir[k]);
        fs.mkdirpSync(dir);
        ret[k] = dir;
    }
    return ret;
}

var uniqueId = function () {
    var i = 0;
    return function () {
        return i ++;
    }
}();


var Pack = function (opt) {
    //todo
    this._need = 0;
    this._done = 0;
    this._ev = {};

};
Pack.prototype = {
    on: function (ev, cb) {
        if (this._ev[ev] == undefined) this._ev[ev] = [];
        this._ev[ev].push(cb);
    },
    fire: function (ev) {
        var args = [].slice.call(arguments, 0);
        args.splice(0, 1);
        var cbs = this._ev[ev];
        if (cbs && cbs.length) {
            cbs.forEach(function (f) {
                f.apply(null, args)
            })
        }
    },
    /**
     * 处理htmlstring中的 img, script, link 标签引用的资源
     * @param  {String} htmlstr 
     * @return {String}         处理好的htmlstring
     */
    parseHtml: function (htmlstr, filePath) {
        var me = this;
        this.zipdir = mkZipDirs(filePath);

        var $ = cheerio.load(htmlstr, {decodeEntities: false, normalizeWhitespace: false});
        $('link,script,img').each(function (i, el) {
            var $this = $(this);
            var tagName = $this.get(0).name;
            var href = tagName === 'link' ? $this.attr('href') : $this.attr('src');
            var attrs = {
                link: 'href',
                script: 'src',
                img: 'src'
            };

            if (reg_http.test(href)) {
                var absDestPath = me.saveFile(href);
                var relaPath = path.relative(path.dirname(filePath), absDestPath);
                $this.attr(attrs[tagName], relaPath);
            }
        });

        // 处理内联style标签
        $('style').each(function (i, el) {
            var $this = $(this);
            var cssstr = $this.html();
            var newCss = me.parseUriInCss(cssstr, filePath);
            $this.html(newCss);
        })

        return $.html();
    },
    parseUriInJs: function (jsstr, filePath) {
        jsstr = this.parseJsLoader(jsstr, filePath);
        //more ...
        //
        return jsstr;
    },
    parseUriInCss: function (cssstr, filePath, uri) {
        var me = this;
        if (uri) {
            // 如果是在线down下来的css, 里面内容即使是相对路径的引用的资源，也要当作在线的处理
            
        }
        // 处理css中引用的在线资源
        cssstr = cssstr.replace(reg_cssurl, function (a, b) {
            if (reg_http.test(b)) {
                var destFile = me.saveFile(b);
                var relaPath = path.relative(path.dirname(filePath), destFile);
                return 'url('+ relaPath +')';
            }
            return a;
        });

        return cssstr;
    },
    parseJsLoader: function (jsstr, filePath) {
        //to be rewrited
        return jsstr;
    },
    saveFile: function (uri) {
        var me = this;
        this._need ++;

        function _dosave (dest, cb) {
            fs.ensureFileSync(dest);

            request(uri)
            .on('end', function () {
                me._done ++;
                cb && cb();
                  clearTimeout(me._timer);
                  me._timer = setTimeout(function () {
                    if (me._need === me._done) {
                        me.fire('complete');
                    }
                  }, 1000);
            }).pipe(fs.createWriteStream(dest));
        }

        if (/\?\?/.test(uri)) {
            // cdn combo url
            var pathes = uri.split('??');
            var file0 = pathes[1].split(',')[0];
            var filetype = file0.substr(file0.lastIndexOf('.')+1, 999);
            var destPath = path.join(this.zipdir[filetype], 'cdncombo_' + uniqueId() + '.' + filetype);
        } else {
            var pathname = url.parse(uri).pathname;
            var filetype = pathname.split('.').pop();
            var destPath = path.join((this.zipdir[filetype] || this.zipdir['img']), pathname);
        }

        // 离线化后根据文件类型递归进行, 图片等资源不用做二次处理
        _dosave(destPath, function () {
            if (filetype === 'js') {
                var jscon = fs.readFileSync(destPath, {encoding:'utf8'});
                var newcon = me.parseUriInJs(jscon, destPath);
                newcon = me.parseUriInCss(newcon, destPath);
                fs.writeFileSync(destPath, newcon, {encoding:'utf8'});
            } else if (filetype === 'css') {
                var csscon = fs.readFileSync(destPath, {encoding:'utf8'});
                var newcon = me.parseUriInCss(csscon, destPath, uri);
                fs.writeFileSync(destPath, newcon, {encoding:'utf8'});
            }
            
        });

        return destPath;
    }
};

module.exports = Pack;