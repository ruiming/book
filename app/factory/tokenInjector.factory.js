(function() {
    'use strict';

    angular
        .module('index')
        .factory('tokenInjector', tokenInjector);

    tokenInjector.$inject = ['$injector','$q','$log'];

    function tokenInjector($injector, $q, $log) {
        return {
            request: function(config) {

                var url = 'https://www.bookist.org/auth_verify';
                var deferred = $q.defer();
                var http = $injector.get('$http');
                if(config.url === url)
                    return config;

                if(sessionStorage.verify === 'true') {
                    var timestamp = new Date().getTime() / 1000;
                    // 时间超过7100s，需要重新验证
                    if (timestamp - localStorage.getItem('createdtime') >= 7100) {
                        sessionStorage.verify = false;
                    }
                    config.headers['token'] = localStorage.getItem('token');
                    config.headers['userid'] = localStorage.getItem('user_id');
                    deferred.resolve(config);
                }
                else {
                    // 验证token
                    http({
                        method: 'GET',
                        url: url,
                        params: {
                            token: localStorage.getItem('token'),
                            user_id: localStorage.getItem('user_id')
                        }
                    }).success(function(response){
                        localStorage.setItem('token', response.token);
                        localStorage.setItem('createdtime', response.time);
                        sessionStorage.verify = 'true';
                        config.headers['token'] = localStorage.getItem('token');
                        config.headers['userid'] = localStorage.getItem('user_id');
                        $log.log('verify OK');
                        deferred.resolve(config);
                    }).error(function(){
                        // 跳转微信登陆
                        $log.log('verify FAIL');
                        // window.location.replace(host);
                        deferred.resolve(config);
                    });
                }
                return deferred.promise;
            }
        };
    }
})();
