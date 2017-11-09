/*!
     * basket.js
     * v0.5.2 - 2015-02-07
     * http://addyosmani.github.com/basket.js
     * (c) Addy Osmani;  License
     * Created by: Addy Osmani, Sindre Sorhus, Andrée Hansson, Mat Scales
     * Contributors: Ironsjp, Mathias Bynens, Rick Waldron, Felipe Morais
     * Uses rsvp.js, https://github.com/tildeio/rsvp.js
     */

(function (window, document) {
    var errortype = false;
    'use strict';
    // 设置调试模式 start
//        var Params = decodeURIComponent(location.href.split("?")[1]);
//        var ParamArr = Params.split("&");
//        for (var i = 0; i < ParamArr.length; i++) {
//            if (ParamArr[i].indexOf("debug") >= 0) {
//                var flag = ParamArr[i].substring(6);
//                var item;
//                if (flag == 1) {
//                    for (item in localStorage) {
//                        if (item.indexOf(basket.storagePrefix) === 0) {
//                            localStorage.removeItem(item);
//
//                        }
//                    }
//                }
//            }
//        }
    // 设置调试模式 end

    var head = document.head || document.getElementsByTagName('head')[0];
    var storagePrefix = 'skill-';
    var defaultExpiration = 5000;
    var inBasket = [];

    var addLocalStorage = function (key, storeObj) {
        try {
            var perfix;
            if (storeObj.common == true) {
                perfix = 'common_';
            } else {
                perfix = basket.storagePrefix;
            }

            //版本控制
            localStorage.setItem(perfix + key, JSON.stringify(storeObj));
//          var newVer = +key.split('=')[1];
//          var newKey = perfix + key.split('?')[0];
//
//          for (item in localStorage) {
//            // console.log(item.toString().length);
//            var oldKey = item.toString().split('?')[0];
//            var oldVer = +item.toString().split('=')[1];
//            // console.log('key',oldKey == newKey);
//            // console.log('ver',oldVer  < newVer);
//            if (oldKey == newKey && oldVer < newVer) {
//              localStorage.removeItem(item);
//            }
//          }

            // MD5
            var newVer = key.split('.')[1];
            var newKey = perfix + key.split('.')[0];

            for (item in localStorage) {
                if(item.toString().split('/')[0] === perfix){
                    // console.log(item.toString().length);
                    var oldKey = item.toString().split('.')[0];
                    var oldVer = item.toString().split('.')[1];
                    // console.log('key',oldKey == newKey);
                    // console.log('ver',oldVer  < newVer);
                    if (oldKey == newKey && oldVer !== newVer) {
                        localStorage.removeItem(item);
                    }
                }

            }


            return true;

        } catch (e) {

            if (e.name.toUpperCase().indexOf('QUOTA') >= 0) {
                var item;
                var tempScripts = [];

                for (item in localStorage) {
                    if (item.indexOf(basket.storagePrefix) === 0) {
                        tempScripts.push(JSON.parse(localStorage[item]));
                    }
                }

                if (tempScripts.length) {
                    tempScripts.sort(function (a, b) {
                        return a.stamp - b.stamp;
                    });

                    basket.remove(tempScripts[0].key);

                    return addLocalStorage(key, storeObj);

                } else {
                    // no files to remove. Larger than available quota
                    return;
                }

            } else {
                // some other error
                return;
            }
        }

    };

    var getUrl = function (url) {
        var promise = new RSVP.Promise(function (resolve, reject) {

            var xhr = new XMLHttpRequest();
            xhr.open('GET', url);

            xhr.onreadystatechange = function () {
                if (xhr.readyState === 4) {
                    if (( xhr.status === 200 ) ||
                        ( ( xhr.status === 0 ) && xhr.responseText )) {
                        resolve({
                            content: xhr.responseText,
                            type: xhr.getResponseHeader('content-type')
                        });
                    } else {
//                reject(new Error(xhr.statusText));
                        resolve({
                            content: '',
                            type: 'error200'
                        });
                    }
                }
            };

            // By default XHRs never timeout, and even Chrome doesn't implement the
            // spec for xhr.timeout. So we do it ourselves.
            setTimeout(function () {
                if (xhr.readyState < 4) {
                    xhr.abort();
                }
            }, basket.timeout);

            xhr.send();
        });

        return promise;
    };

    var saveUrl = function (obj) {
        return getUrl(obj.url).then(function (result) {
            var storeObj = wrapStoreData(obj, result);

            if (!obj.skipCache) {
                addLocalStorage(obj.key, storeObj);
            }

            return storeObj;
        });
    };

    var wrapStoreData = function (obj, data) {
        // console.log(obj);
        var now = +new Date();
        obj.data = data.content;
        obj.originalType = data.type;
        if(obj.originalType === 'error200'){
            obj.skipCache = true;
        }
        obj.type = obj.type || data.type;
        obj.id = obj.id || '';
        obj.skipCache = obj.skipCache || false;
        obj.stamp = now;
        obj.expire = now + ( ( obj.expire || defaultExpiration ) * 60 * 60 * 1000 );

        return obj;
    };

    var isCacheValid = function (source, obj) {
        return !source ||
            source.expire - +new Date() < 0 ||
            obj.unique !== source.unique ||
            (basket.isValidItem && !basket.isValidItem(source, obj));
    };

    var handleStackObject = function (obj) {
        var source, promise, shouldFetch;

        if (!obj.url) {
            return;
        }

        obj.key = ( obj.key || obj.url );
        source = basket.get(obj.key);

        obj.execute = obj.execute !== false;

        shouldFetch = isCacheValid(source, obj);

        if (obj.live || shouldFetch) {
            if (obj.unique) {
                // set parameter to prevent browser cache
                obj.url += ( ( obj.url.indexOf('?') > 0 ) ? '&' : '?' ) + 'basket-unique=' + obj.unique;
            }
            promise = saveUrl(obj);

            if (obj.live && !shouldFetch) {
                promise = promise
                    .then(function (result) {
                        // If we succeed, just return the value
                        // RSVP doesn't have a .fail convenience method
                        return result;
                    }, function () {
                        return source;
                    });
            }
        } else {
            source.type = obj.type || source.originalType;
            source.execute = obj.execute;
            promise = new RSVP.Promise(function (resolve) {
                resolve(source);
            });
        }

        return promise;
    };

    var injectScript = function (obj) {
        // console.log(obj)
        if(errortype == true){
            return;
        }
        if(obj.originalType === 'error200'){
            errortype = true;
        }else{

            if (obj.type !== 'css') {
                var script = document.createElement('script');
                script.defer = true;
                // Have to use .text, since we support IE8,
                // which won't allow appending to a script
                script.text = obj.data;
                script.type = obj.type;
                script.id = obj.id;
                head.appendChild(script);
            } else {
                var style = document.createElement('style');
                var textNode = document.createTextNode(obj.data);
                style.appendChild(textNode);
                head.appendChild(style);
            }
        }


    };

    var handlers = {
        'default': injectScript
    };

    var execute = function (obj) {
        if (obj.type && handlers[obj.type]) {
            return handlers[obj.type](obj);
        }

        return handlers['default'](obj); // 'default' is a reserved word
    };

    var performActions = function (resources) {
        return resources.map(function (obj) {
            if (obj.execute) {
                execute(obj);
            }

            return obj;
        });
    };

    var fetch = function () {
        var i, l, promises = [];

        for (i = 0, l = arguments.length; i < l; i++) {
            promises.push(handleStackObject(arguments[i]));
        }

        return RSVP.all(promises);
    };

    var thenRequire = function () {
        var resources = fetch.apply(null, arguments);
        var promise = this.then(function () {
            return resources;
        }).then(performActions);
        promise.thenRequire = thenRequire;
        return promise;
    };

    window.basket = {
        storagePrefix: '',
        require: function () {
            for (var a = 0, l = arguments.length; a < l; a++) {
                arguments[a].execute = arguments[a].execute !== false;

                if (arguments[a].once && inbasket.indexOf(arguments[a].url) >= 0) {
                    arguments[a].execute = false;
                } else if (arguments[a].execute !== false && inBasket.indexOf(arguments[a].url) < 0) {
                    inBasket.push(arguments[a].url);
                }
            }

            var promise = fetch.apply(null, arguments).then(performActions);

            promise.thenRequire = thenRequire;
            return promise;
        },

        remove: function (key) {
            if (localStorage.getItem('common_' + key)) {
                localStorage.removeItem('common_' + key)
                return this;
            } else {
                localStorage.removeItem(basket.storagePrefix + key);
                return this;
            }

        },

        get: function (key) {
            var item;

            if (localStorage.getItem('common_' + key)) {
                item = localStorage.getItem('common_' + key);
            } else {
                item = localStorage.getItem(basket.storagePrefix + key);
            }


            try {
                return JSON.parse(item || 'false');
            } catch (e) {
                return false;
            }
        },

        clear: function (expired) {
            var item, key;
            var now = +new Date();

            for (item in localStorage) {
                if (item.indexOf(basket.storagePrefix) === 0) {
                    key = item.split(basket.storagePrefix)[1];
                    if (key && ( !expired || this.get(key).expire <= now )) {
                        this.remove(key);
                    }
                }

            }

            return this;
        },

        isValidItem: null,

        timeout: 5000,

        addHandler: function (types, handler) {
            if (!Array.isArray(types)) {
                types = [types];
            }
            types.forEach(function (type) {
                handlers[type] = handler;
            });
        },

        removeHandler: function (types) {
            basket.addHandler(types, undefined);
        },

        init: function (arr, prefix) {
            this.storagePrefix = prefix;
            var len = arr.length;
            var that;
            for (var i = 0; i < len; i++) {
                if (i == 0) {
                    that = this.require(arr[i]);
                } else {
                    that = that.thenRequire(arr[i]);
                }
            }

            // 删除失效即不在arr里的prefix为当前页的js
            var jsObj = {};
            for (var i = 0; i < len; i++) {
                jsObj[prefix + arr[i].url] = arr[i].url;
            }

            for (item in localStorage) {
                if (item.indexOf(prefix) === 0) {
                    if (!jsObj[item]) {
                        localStorage.removeItem(item);
                    }
                }
            }
        }

    };

    // delete expired keys
    basket.clear(true);

})(window, document);
