routeApp.controller('MeCtrl',function($scope, $http) {

    // todo 返回用户信息，gravatar,name,cart,order{wait,received}
    $http({
        method: 'GET',
        url: host + '/user'
    }).success(function(response){
        $scope.user = response;
    });
    
});
