routeApp.factory('BL', function($http){
    var BL = function(url,params){
        this.list = [];
        this.busy = false;
        this.url = url;
        this.params = params;
        this.continue = true;      // 是否继续
    };
    BL.prototype.nextPage = function(){
        if(!this.continue){
            this.busy = false;
            return;
        }
        if(this.busy) return;
        this.busy = true;
        $http({
            method: 'GET',
            url: this.url,
            params: this.params
        }).success(function(response){
            var list = response;
            if(list.length < 5 ) {
                this.continue = false;
            }
            for (var i = 0 ;i < list.length; i++){
                list[i].star = Math.ceil(list[i].rate/2);
                this.list.push(list[i]);
            }
            this.busy = false;
            this.params.page += 1;
        }.bind(this));
    };
    return BL;
});
routeApp.factory('UserMessage', function () {

    var _address = [];
    var _signature = '';
    var _temp = {};

    return {
        getAddress: function () {
            return _address;
        },
        getSignature: function() {
            return _signature;
        },
        getTemp: function() {
            return _temp;
        },
        setAddress: function (address) {
            _address = address;
        },
        setSignature: function(signature) {
            _signature = signature;
        },
        setTemp: function(temp) {
            _temp = temp;
        }
    };
});
routeApp.factory('timestampMarker', [function() {
    var timestampMarker = {
        request: function(config) {
            config.requestTimestamp = new Date().getTime();
            return config;
        },
        response: function(response) {
            response.config.responseTimestamp = new Date().getTime();
            return response;
        }
    };
    return timestampMarker;
}]);
routeApp.factory('tokenInjector', ['$injector','$q', '$location', function($injector,$q){
    var tokenInjector = {
        request: function(config){

            var url = host + '/auth_verify';
            var deferred = $q.defer();
            var http = $injector.get('$http');
            
            if(config.url === url)
                return config;


            if(sessionStorage.verify === "true") {
                console.log("verify already, wait some time to retry...");
                var timestamp = new Date().getTime() / 1000;
                // 时间超过7000s，需要重新验证
                if (timestamp - sessionStorage.createdtime >= 7000){
                    sessionStorage.verify = false;
                    console.log("verify already, but will try verify again before next request");
                }
                config.headers['token'] = sessionStorage.token;
                config.headers['userid'] = sessionStorage.user_id;
                deferred.resolve(config);
            }
            else {
                // 验证token
                http({
                    method: 'GET',
                    url: url,
                    params: {
                        token: sessionStorage.token,
                        user_id: sessionStorage.user_id
                    }
                }).success(function(response){
                    sessionStorage.token = response.token;
                    sessionStorage.createdtime = response.time;
                    sessionStorage.verify = "true";
                    config.headers['token'] = sessionStorage.token;
                    config.headers['userid'] = sessionStorage.user_id;
                    console.log("verify OK");
                    deferred.resolve(config);
                }).error(function(){
                    // 跳转微信登陆
                    console.log("verify FAIL");
                    // todo  cancel comment when work
                    window.location.replace(host);
                    deferred.resolve(config);
                });
            }
            
            return deferred.promise;
        }
    };
    return tokenInjector;
}]);