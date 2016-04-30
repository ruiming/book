routeApp.controller('MeCtrl',function($scope, $http) {

    // 返回用户信息，gravatar,name,cart,order{wait,received}
    $http({
        method: 'GET',
        url: host + '/user_info'
    }).success(function(response){
        $scope.user = response;
    });
    
});
