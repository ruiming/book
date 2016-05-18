routeApp.controller('OrdersCtrl',function($scope, $http, $stateParams) {

    $scope.message = false;
    $scope.busy = true;
    $scope.wait = false;        // 取消订单提示
    $scope.type = $stateParams.status;
    console.log($stateParams.status);

    // 非法参数，返回
    if($stateParams.status !== "pending"
        && $stateParams.status !== "all"
        && $stateParams.status !== "commenting"
        && $stateParams.status !== "waiting"
        && $stateParams.status !== "refund"
    ) {
        history.back();
    }

    // 获取全部订单
    $http({
        method: 'GET',
        url: host + '/user_billings',
        params: {
            status: "all"
        }
    }).success(function(response){
        $scope.orders = response;
        for(x in $scope.orders){
            $scope.orders[x].status = statusDict[$scope.orders[x].status];
        }
        $scope.busy = false;
    });

    // 取消订单    pending -> canceled
    $scope.cancel = function(order){
        order.wait2 = true;
        $http({
            method: 'DELETE',
            url: host + '/billing',
            data: {
                "id": order.id
            }
        }).success(function(){
            order.wait2 = false;
            order.status = "已取消";
        });
    };

    // 确认收货    waiting -> commenting
    $scope.receipt = function(order){
        order.wait2 = true;
        $http({
            method: 'PUT',
            url: host + '/billing',
            data: {
                "id": order.id,
                "status": "commenting"
            }
        }).success(function(){
            order.wait2 = false;
            order.status = "待评价";
        });
    };

});
