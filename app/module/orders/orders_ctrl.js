routeApp.controller('OrdersCtrl',function($scope, $http, $stateParams) {

    $scope.message = false;
    $scope.busy = true;
    $scope.wait = false;        // 取消订单提示
    $scope.type = $stateParams.status;
    console.log($stateParams.status);

    /*
     * 备注:
     * return    传回 commenting, done订单
     * on_return 传回 refund, refunding, refunded, replace, replaced, replacing, refund_refused, replace_refused 订单
     *
     */

    // 非法参数，返回
    if($stateParams.status !== "pending"
        && $stateParams.status !== "all"
        && $stateParams.status !== "commenting"
        && $stateParams.status !== "waiting"
        && $stateParams.status !== "return"
        && $stateParams.status !== "done"
    ) {
        history.back();
    }
    else if($stateParams.status == "return") {
        // todo 获取正在申请售后服务的订单
        $http({
            method: 'GET',
            url: host + '/user_billings',
            params: {
                status: "on_return"
            }
        }).success(function(response){
            $scope.orders_return = response;
            for(var x in $scope.orders_return){
                if($scope.orders_return.hasOwnProperty(x)){
                    $scope.orders_return[x].status = statusDict[$scope.orders_return[x].status];
                }
            }
        });
    }

    // 获取订单
    $http({
        method: 'GET',
        url: host + '/user_billings',
        params: {
            status: $stateParams.status
        }
    }).success(function(response){
        $scope.orders = response;
        for(var x in $scope.orders){
            if($scope.orders.hasOwnProperty(x)){
                $scope.orders[x].status = statusDict[$scope.orders[x].status];
            }
        }
        $scope.busy = false;
    });

    // todo 取消售后
    $scope.stop = function(order){
        order.wait2 = true;
    };

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
