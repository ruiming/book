routeApp.controller('OrdersCtrl',function($scope, $http, $stateParams) {

    $scope.message = false;
    $scope.busy = true;
    $scope.wait = false;        // 取消订单提示
    var status = $stateParams.status;

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

    // todo 取消订单
    $scope.cancel = function(order){
        $scope.wait = true;
        order.wait2 = true;
        $http({
            method: 'DELETE',
            url: host + '/billing',
            data: {
                "id": order.id,
                "status": "pending"
            }
        }).error(function(){
            order.wait2 = false;
            order.status = "已取消";
            window.setTimeout(function() {
                $scope.$apply(function() {
                    $scope.wait = false;
                });
            }, delay);
        });
    };

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
    };

});
