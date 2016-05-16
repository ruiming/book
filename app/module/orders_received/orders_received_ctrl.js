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

    // todo 确认收货
    $scope.receipt = function(order, index){
        $http({
            method: 'POST',
            url: host + '/order',
            data: {
                "id": order.id
            }
        }).success(function(){
            $scope.orders.splice(index, 1);
        });
    };

});
