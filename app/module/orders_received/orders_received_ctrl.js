routeApp.controller('OrdersReceivedCtrl',function($scope, $http) {
    
    $scope.message = false;
    $scope.busy = true;

    // todo 获取已收货（待评价）订单
    $http({
        method: 'GET',
        url: host + '/orders',
        params: {
            type: "received"
        }
    }).success(function(response){
        $scope.orders = response;
        $scope.busy = false;
    });

});
