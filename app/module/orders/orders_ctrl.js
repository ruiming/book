routeApp.controller('OrdersCtrl',function($scope, $http) {

    $scope.message = false;
    $scope.busy = true;

    // todo 获取全部订单
    $http({
        method: 'GET',
        url: host + '/orders',
        params: {
            type: "all"
        }
    }).success(function(response){
        $scope.orders = response;
        $scope.orders = response;
        $scope.busy = false;
    });

    // todo 确认收货
    $scope.receipt = function(order){
        $http({
            method: 'POST',
            url: host + '/order',
            data: {
                "id": order.id
            }
        }).success(function(){
            order.status = "待评价";
        });
    }

});
