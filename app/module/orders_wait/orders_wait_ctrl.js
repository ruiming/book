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
