# PackageTool

v0.0.9
A package tool for Mtb-PackageApp auto-checking & auto-packing

## Usage

```shell
$ npm install -g packageapp
```

```
  Usage: pack [options] <htmlfile ...>

  Options:

    -h, --help            output usage information
    -V, --version         output the version number
    -p --prefix [string]  Prefix of dest file, if not assigned, source file will be rewrited
    -z --zip <path>       Dest Zip Path, default is `process.cwd()`
```

比如，打包当前目录为一个Package Zip，默认会将所有js，css，image离线化，并自动压缩。
```shell
$ pack ./*.html
```
或者，直接将线上页面抓去所有依赖资源并离线化打包
```
$ pack http://m.taobao.com
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
+ 根据.gitignore忽略文件和文件夹打包
+ 根据线上页面url地址自动抓取项目资源离线化打包


## 使用需知

在使用这个[PackageApp]()打包工具之前，可以先了解一下[PackageApp]()是什么。为了更好更方便大家基于[PackageApp]()的原理和规范一键将你的项目接入PackageApp，我们产生了一些工具可以方便的提供给大家使用。

本质上来讲，[AWP]()平台提供的PackageApp这个功能，原理上是基于预置包的形式，将我们项目资源提前预置到客户端中，于是当访问这个项目资源的时候，其依赖的资源读取相当于是直接读取本地文件，省去了网络的开销和资源下载。从而提升web app性能。

他需要我们把项目打包成一个zip，并且项目中主要的资源依赖是需要在zip包里一起，并且在项目里是相对路径引用的形式，这样才能达到PackageApp加速的目的。而我们的工具基本上就是针对这个过程，做了这么几件主要的事情。

+ 分析项目中所有的资源依赖，把在线资源离线化
+ 将资源引用的url替换为离线化后的资源的相对路径
+ 全部资源分析和离线化完成之后，打包成zip供直接上传。

在这个过程中，我们提供了针对不同业务场景，有不同特异化需求的BU予不同的工具选择。

+ 基于kimi开发规范的同学(Taobao)可以选择使用 [`def kimi zip`](http://www.atatech.org/articles/29745?rnd=146754725) 插件，来自@妙净
+ 基于Kissy-Mobile开发的同学(Tmall)可以选择使用 @跑猪 提供的 [PackTool]() 打包工具
+ 无业务规范捆绑，或者普通web app可以选择使用 [Packageapp](https://www.npmjs.com/package/packageapp) @岑安 提供

以上工具除了共性的做了资源依赖分析和离线化处理之外，每个工具针对相应的业务规范或者需求提供了额外的一些features，具体的差别可以查看每个工具提供的Features列表。

以下针对[Packageapp](https://www.npmjs.com/package/packageapp) 工具的使用和注意事项做一个详细的说明，供大家参考。

## [Packageapp](https://www.npmjs.com/package/packageapp)

如上，经过
```shell
$ npm install -g packageapp
```
安装好之后。就可以开始选择一个本地的项目进行离线化分析和打包。比如我有一个简单的页面是这样。
`test`目录下有两个页面
![img](http://gw.alicdn.com/tfscom/TB16gJDHpXXXXXMXpXXkQvV2pXX-220-122.png)
其中`testA.html` 页面大致如下。
![img](http://gw.alicdn.com/tfscom/TB1uvlFHpXXXXbqXXXXfH0O8pXX-900-411.png)

我们需要将这两个文件都进行离线分析，路径替换和打包。
```
$ pack test/*.html -p z_
```



