(function() {
    'use strict';

    angular
        .module('index')
        .factory('tokenInjector', tokenInjector);

    function tokenInjector($injector, $q, $window, lang, $timeout, $base64, $location, $cookies) {

        let token = null;

        return {
            setAuth: function(t) {
                token = t;
                $window.localStorage.setItem('token', t);
                $window.sessionStorage.setItem('token', t);
                var expireDate = new Date();
                expireDate.setDate(expireDate.getDate() + 360);
                $cookies.put('token', t, {expires: expireDate});
            },
            request: function(config) {
                if(token == null && token !== 'null') {
                    token = $cookies.get('token') || $window.localStorage.getItem('token');
                    if(token !== null && token !== 'null') {
                        var expireDate = new Date();
                        expireDate.setDate(expireDate.getDate() + 360);
                        $cookies.put('token', token, {expires: expireDate});
                        $window.localStorage.setItem('token', token);
                    }
                }
                if(token !== null && token !== 'null') {
                    config.headers['token'] = token;                    
                }
                return config;
            },
            responseError: function(config) {
                if(config.status === 401) {
                    notie.alert(1, '请先登陆', 0.3);
                    $timeout(() => {
                        $window.location.href = "#/auth?redirectUrl=" + encodeURIComponent($base64.encode($window.location.hash));
                    }, 300);
                    return $q.reject(config);
                } else if (config && config.data && config.data.message) {
                    let message = config.data.message;
                    if(typeof message === 'string') {
                        config.data.message = lang[string];
                    } else if(typeof message === 'object') {
                        let str = '';
                        for(let key in message) {
                            if(message.hasOwnProperty(key)) {
                                if(lang[message[key]] !== undefined) key = lang[message[key]];          
                                else key = message[key];                      
                                str += str === '' ? key : ', ' + key;
                            }
                        }
                        config.data.message = str;
                    }
                    return $q.reject(config);
                } else if (config.status === 500) {
                    notie.alert(1, '发生了不明觉厉的错误', 0.3);
                    return $q.reject(config);
                }
            }
        };
    }
})();
