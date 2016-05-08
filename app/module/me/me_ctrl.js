routeApp.controller('MeCtrl',function($scope, $http) {

    // 返回用户信息，gravatar,name,cart,order{wait,received}
    $http({
        method: 'GET',
        url: host + '/user_info'
    }).success(function(response){
        $scope.user = response;
        $scope.user.cart = 5;
        $scope.user.order = {
            wait: 4,
            received: 3
        };
        sessionStorage.name = $scope.user.username;
        sessionStorage.avatar = $scope.user.avatar;
    });
    
});
