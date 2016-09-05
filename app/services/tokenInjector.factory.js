(function() {
    'use strict';

    angular
        .module('index')
        .factory('tokenInjector', tokenInjector);

    tokenInjector.$inject = ['$injector','$q', '$window'];

    function tokenInjector($injector, $q, $window) {

        let verify = false;
        let createdtime = null;
        let token = null;
        let userid = null;

        return {
            setAuth: function(t, u) {
                token = t;
                userid = u;
                $window.localStorage.setItem('token', t);
                $window.localStorage.setItem('userid', u);
            },
            request: function(config) {
                var url = 'https://www.bookist.org/auth_verify';
                var deferred = $q.defer();
                var http = $injector.get('$http');
                if(config.url === url)
                    return config;
                if(verify) {
                    var timestamp = new Date().getTime() / 1000;
                    // 时间超过7100s，需要重新验证
                    if (timestamp - createdtime >= 7100) {
                        verify = false;
                    }
                    config.headers['token'] = token;
                    config.headers['userid'] = userid;
                    deferred.resolve(config);
                } else {
                    // 验证token
                    http({
                        method: 'GET',
                        url: url,
                        params: {
                            token: token,
                            user_id: userid
                        }
                    }).success(function(response) {
                        // TODO experimental
                        token = response.token || response.data.token || token;
                        $window.localStorage.setItem('token', token);
                        createdtime = response.time;
                        verify = true;
                        config.headers['token'] = token;
                        config.headers['userid'] = userid;
                        deferred.resolve(config);
                    }).error(function(){
                        // window.location.replace(host);
                        deferred.resolve(config);
                    });
                }
                return deferred.promise;
            }
        };
    }
})();
