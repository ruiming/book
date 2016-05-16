routeApp.controller('OrdersWaitCtrl',function($scope, $http) {

    $scope.busy = true;

    // todo 获取待收货订单
    $http({
        method: 'GET',
        url: host + '/user_billings',
        params: {
            status: "pending"
        }
    }).success(function(response){
        $scope.orders = response;
        for(x in $scope.orders){
            $scope.orders[x].status = statusDict[$scope.orders[x].status];
        }
        $scope.busy = false;
    });

    // todo 取消订单
    $scope.cancel = function(order, index){
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
