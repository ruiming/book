routeApp.controller('OrderDetailCtrl',function($scope, $http, $stateParams){

    $scope.busy = true;

    // todo 获取订单详细信息
    $http({
        method: 'GET',
        url: host + '/orders',
        params: {
            id: $stateParams.id
        }
    }).success(function(response){
        $scope.order = response;
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
            $scope.order.process.push({'status':'已收货','time': '2015-04-03 12:12:00'});
            $scope.order.status = "待评价";
            $scope.turn = 3;
        });
    };
});
