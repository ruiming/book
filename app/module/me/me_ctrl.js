routeApp.controller('MeCtrl',function($scope, $http) {

    // 返回用户信息，gravatar,name,cart,order{wait,received}
    if(sessionStorage.user != undefined) {
        $scope.user = JSON.parse(sessionStorage.user);
        $http({
            method: 'GET',
            url: host + '/user_info'
        }).success(function(response){
            $scope.user.cart = response.cart_num;
            $scope.user.order = {
                wait: 0,
                received: 0
            };
        });
    }
    else {
        $http({
            method: 'GET',
            url: host + '/user_info'
        }).success(function(response){
            $scope.user = response;
            $scope.user.order = {
                wait: 0,
                received: 0
            };
            sessionStorage.user = JSON.stringify(response);
        });
    }

    
});
