!function(a,b){function c(a){return function(b){a&&a(b)}}function d(a){return function(b){a&&a(b)}}function e(a,b){for(var c=0;c<a.length;c++)if(b===a[c])return c;return-1}if(b){var f=a.document;if(b.api={},b.api.base=function(){return{isWindVaneEnvironment:function(){return a.navigator.userAgent.match(/WindVane/i)?!0:!1},isWindVaneSDK:function(a,e){b.call("Base","isWindVaneSDK","",c(a),d(e),500)},plusUT:function(a,e,f){b.call("Base","plusUT",JSON.stringify(f),c(a),d(e))},showShareMenu:function(a,e,f){b.call("TBSharedModule","showSharedMenu",JSON.stringify(f),c(a),d(e))},getDeviceInfo:function(a,e){b.call("TBDeviceInfo","getInfo","",c(a),d(e))}}}(),b.api.shake=function(){var g,h=[];return f.addEventListener("motion.shake",function(b){h.forEach(function(c){a.clearTimeout(g),c(b)})},!1),{startWatch:function(f,i,j){if(0===h.length){var k={on:!0};b.call("WVMotion","listeningShake",k,c(),d(i))}e(h,f)<0&&h.push(f),j&&j.timeout&&0<j.timeout&&(a.clearTimeout(g),g=a.setTimeout(i,j.timeout))},stopWatch:function(a,f,g){if(g){var i;(i=e(h,g))>=0&&h.splice(i,1)}else h=[];if(0===h.length){var j={on:!1};b.call("WVMotion","listeningShake",j,c(a),d(f))}}}}(),b.api.geolocation=function(){var e;return{get:function(a,c,e){b.call("WVLocation","getLocation",JSON.stringify(e),function(b){if(b&&!b.coords&&b.lat&&b.lon){var c={coords:{longitude:b.lon,latitude:b.lat}};a(c)}else a(b)},d(c))},search:function(a,e,f){b.call("WVLocation","searchLocation",JSON.stringify(f),c(a),d(e))},watch:function(b,c,d){var f=500;d&&d.frequence&&f<d.frequence&&(f=d.frequence),a.clearInterval(e);var g,h=this,i=!0,j=!1;return e=a.setInterval(function(){(i||j)&&h.get(function(a){j=!0,i=!1,g&&g.coords.longitude==a.coords.longitude&&g.coords.latitude==a.coords.latitude||(g=a,b(a))},function(a){c(a)},d)},f)},clear:function(b){a.clearInterval(b)}}}(),b.api.cookies=function(){return{read:function(a,e){var f={url:a};b.call("WVCookie","readCookies",f,c(e),d())},write:function(a,e,f,g){3===arguments.length&&"function"==typeof arguments[2]&&(g=arguments[2],f={});var h={name:a,value:e};for(var i in f)h[i]=f[i];b.call("WVCookie","writeCookies",h,c(g),d())}}}(),b.api.weburl=function(){return{intercept:function(a,e,f){var g={url:f};b.call("WVWebUrl","intercept",g,c(a),d(e))}}}(),b.api.server=function(){return{send:function(a,e,f){b.call("WVServer","send",JSON.stringify(f),c(a),d(e))}}}(),b.api.blow=function(){function a(a){c&&c(a.param)}var c,e=!1;return{listenBlow:function(g,h,i){c=i,e||b.call("WVMotion","listenBlow","",function(b){e=!0,g&&g(b),f.addEventListener("motion.blow",a,!1)},d(h))},stopListenBlow:function(c,g){e&&b.call("WVMotion","stopListenBlow","",function(b){e=!1,c&&c(b),f.removeEventListener("motion.blow",a)},d(g))}}}(),b.api.camera=function(){return{takePhoto:function(a,e,f){b.call("WVCamera","takePhoto",f,c(a),d(e))},confirmUploadPhoto:function(a,e,f){b.call("WVCamera","confirmUploadPhoto",f,c(a),d(e))}}}(),b.api.base.isWindVaneEnvironment()){var g=a.navigator.geolocation;g.getCurrentPosition=function(a,c,d){b.api.geolocation.get(a,c,d)},g.watchPosition=function(a,c,d){return b.api.geolocation.watch(a,c,d)},g.clearWatch=function(a){b.api.geolocation.clear(a)},g.searchPosition=function(a,c,d){b.api.geolocation.search(a,c,d)}}}}(window,window.WindVane);!function(win){function setUnitA(){win.rem=docEl.getBoundingClientRect().width/16,docEl.style.fontSize=win.rem+"px"}var h,dpr=1,scale=1/dpr,docEl=document.documentElement,metaEl=document.createElement("meta");if(win.dpr=dpr,win.addEventListener("resize",function(){clearTimeout(h),h=setTimeout(setUnitA,300)},!1),win.addEventListener("pageshow",function(e){e.persisted&&(clearTimeout(h),h=setTimeout(setUnitA,300))},!1),docEl.setAttribute("data-dpr",dpr),metaEl.setAttribute("name","viewport"),metaEl.setAttribute("content","initial-scale="+scale+", maximum-scale="+scale+", minimum-scale="+scale+", user-scalable=no"),docEl.firstElementChild)docEl.firstElementChild.appendChild(metaEl);else{var wrap=document.createElement("div");wrap.appendChild(metaEl),document.write(wrap.innerHTML)}setUnitA()}(window);