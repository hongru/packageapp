# PackageTool

v0.1.3
A package tool for Mtb-PackageApp auto-checking & auto-packing

[![NPM version][npm-image]][npm-url]
[![Build status][travis-image]][travis-url]
[![Test coverage][coveralls-image]][coveralls-url]
[![Downloads][downloads-image]][downloads-url]

## Usage

```shell
$ npm install -g packageapp
```

```
  Usage: pack [options] <htmlfile ...>

  Options:

    -h, --help            output usage information
    -V, --version         output the version number
    -p --prefix [string]  Prefix of dest file
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

在使用这个[PackageApp](http://www.atatech.org/articles/23279)打包工具之前，可以先了解一下[PackageApp](http://www.atatech.org/articles/23279)是什么。为了更好更方便大家基于[PackageApp](http://www.atatech.org/articles/23279)的原理和规范一键将你的项目接入PackageApp，我们产生了一些工具可以方便的提供给大家使用。

本质上来讲，[AWP](http://h5.taobao.org)平台提供的PackageApp这个功能，原理上是基于预置包的形式，将我们项目资源提前预置到客户端中，于是当访问这个项目资源的时候，其依赖的资源读取相当于是直接读取本地文件，省去了网络的开销和资源下载。从而提升web app性能。

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

## [Packageapp Tool](https://www.npmjs.com/package/packageapp)

如上，经过
```shell
$ npm install -g packageapp
```
安装好之后。就可以开始选择一个本地的项目进行离线化分析和打包。比如我有一个简单的页面是这样。
`tests`目录下有两个页面
![img](http://gw.alicdn.com/tfscom/TB16gJDHpXXXXXMXpXXkQvV2pXX-220-122.png)
其中`testA.html` 页面大致如下。
![img](http://gw.alicdn.com/tfscom/TB1uvlFHpXXXXbqXXXXfH0O8pXX-900-411.png)

我们需要将这两个文件都进行离线分析，在项目根目录`tests`下运行
```
$ pack *.html
```
![img](http://gw.alicdn.com/tfscom/TB1XxltHpXXXXXIaXXXWiF.3XXX-700-97.png)

执行完成后，可以看到，在执行命令的项目根目录里多了一个`app.zip` 和 `www` 文件夹。

![img](http://gw.alicdn.com/tfscom/TB1cptDHpXXXXazXpXXhAP7NVXX-400-123.png)

其中`www`文件夹中就是离线化好的项目文件以及各种资源。可以直接访问离线化后的页面验证是否资源已经离线完毕并且路径替换正确。
而 `app.zip`就是离线化完成的`www`文件夹的打包。验证无误后可以直接上传AWP的PackageApp。

再来看看离线化后`www`目录下的`testA.html` 文件。

![img](http://gw.alicdn.com/tfscom/TB1l4JtHpXXXXbFaXXX4G8M8pXX-900-400.png)

可以发现页面资源已经全部离线化并替换url。包括引用的`shake.css`中的在线图片资源也已经全部离线化。

![img](http://gw.alicdn.com/tfscom/TB10tlFHpXXXXcCXXXXxfsU1XXX-1000-174.png)
变成
![img](http://gw.alicdn.com/tfscom/TB1nYJBHpXXXXX7XFXXgqZT1XXX-1000-166.png)


使用过程就是这么简单。工具提供了两个参数

+ `-p --prefix` 用于指定离线化html文件的前缀，默认没有前缀就是原来的文件名
+ `-z --zip` 用于指定生成的zip文件地址，默认在执行命令的当前目录，也就是项目根目录。

### 需要注意的几个事项

1. 工具以html文件为入口，分析html文件依赖的在线js，css，img资源，会自动提取离线并替换路径。同时，如果依赖的css文件中又有依赖在线的图片，字体等资源，也会自动离线资源并替换路径。
2. js文件和内容中只能处理完整的url资源路径的提取和替换，但是有路径拼接的资源暂时不能分析和提取。
3. 如果html文档中有不想被离线化的资源，可以在html标签上加上`keeplive`的属性。
4. css 和 js内容中如果有不想被离线的资源，暂时没有提供此功能，今后考虑以规范注释的形式加上。
5. 本工具只负责项目离线化分析和路径替换以及项目打包。zip包自动上传并发布的功能参考 [PackTool](http://gitlab.alibaba-inc.com/h5-tools/packapp/blob/master/lib/upload.js) 的zip包上传发布工具。


