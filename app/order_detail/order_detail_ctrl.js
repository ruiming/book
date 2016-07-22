angular
    .module('index')
    .controller('OrderDetailCtrl',function($scope, $http, $stateParams){

    $scope.price = 0;
    $scope.busy = true;
    $scope.status_list = [];
    $scope.wait2 = false;           // 操作时延

    // 获取订单详细信息
    $http({
        method: 'GET',
        url: host + '/billing',
        params: {
            id: $stateParams.id
        }
    }).success(function(response){
        $scope.order = response;
        $scope.order.status = statusDict[$scope.order.status];
        for(var i=0; i<$scope.order.carts.length; i++) {
            $scope.price += $scope.order.carts[i].number * $scope.order.carts[i].price;
        }
        for(var j=0; j<$scope.order.status_list.length; j++) {
            $scope.status_list.push({
                "status": statusDict[$scope.order.status_list[j].status],
                "content": $scope.order.status_list[j].content,
                "time": $scope.order.status_list[j].time
            });
        }
        $scope.busy = false;
    });

    // 取消订单
    $scope.cancel = function(order){
        $scope.wait2 = true;
        $http({
            method: 'DELETE',
            url: host + '/billing',
            data: {
                "id": order.id
            }
        }).success(function(){
            $scope.wait2 = false;
            $scope.order.status = "已取消";
            $scope.status_list.push({'status':'已取消','time': Date.parse(new Date())/1000});
        });
    };

    // 确认收货
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
            $scope.status_list.push({'status':'已收货','time': Date.parse(new Date())/1000});
            $scope.order.status = "待评价";
        });
    };
});
