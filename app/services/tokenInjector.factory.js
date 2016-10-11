(function() {
    'use strict';

    angular
        .module('index')
        .factory('tokenInjector', tokenInjector);

    function tokenInjector($injector, $q, $window, lang, $timeout, $base64, $location, $cookies) {

        let token = null;

        return {
            setAuth: function(t) {
                if(token !== null) {
                    token = t;
                    $window.localStorage.setItem('token', t);
                    $window.sessionStorage.setItem('token', t);
                    $cookies.put('token', t);
                }
            },
            request: function(config) {
                var deferred = $q.defer();
                config.headers['token'] = token || $window.sessionStorage.getItem('token') || $window.localStorage.getItem('token') || $cookies.get('token');
                deferred.resolve(config);
                return deferred.promise;
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
                            if(message.hasOwnProperty(key)) str += str === '' ? lang[message[key]] : ', ' + lang[message[key]];
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
