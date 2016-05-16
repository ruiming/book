routeApp.controller('OrdersWaitCtrl',function($scope, $http) {

    $scope.busy = true;

    // todo 获取待收货订单
    $http({
        method: 'GET',
        url: host + '/orders',
        params: {
            type: "wait"
        }
    }).success(function(response){
        $scope.orders = response;
        $scope.busy = false;
    });
    
});
