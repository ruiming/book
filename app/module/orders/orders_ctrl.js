routeApp.controller('OrdersCtrl',function($scope, $http) {

    $scope.message = false;
    $scope.busy = true;

    // 获取全部订单
    $http({
        method: 'GET',
        url: host + '/user_billings',
        params: {
            status: "all"
        }
    }).success(function(response){
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
        }).error(function () {
            order.status = "待评价";
        });
    }

});
