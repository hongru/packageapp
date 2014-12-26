# PackageTool

v0.0.5
A package tool for Mtb-PackageApp auto-checking & auto-packing

## Usage

```shell
$ npm install -g packageapp
$ pack [dir to be packed]
```

比如，打包当前目录为一个Package Zip，默认会将所有js，css，image离线化，并自动压缩。
```shell
$ pack ./
```

如果需要不压缩的css和js用于debug，可以加参数`--debug` 或者 `-d`
```shell
$ pack -d ./
```

html文件里面不需要 离线的url可以在tag上加上`keeplive`的属性即可。比如：
```javascript
<script src="http://aaa.js" keeplive></script>
```

## PackageTool 集成功能

+ link标签资源自动离线
+ script标签资源自动离线
+ img标签图片自动离线
+ css引用资源(图片，字体)自动离线
+ js脚本中引用资源自动离线
+ 离线资源（js,css,image）自动压缩
+ 自动打包成规范zip供上传
+ 检查生成zip包大小


