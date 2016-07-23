(function(){
    "use strict";
    angular
        .module('index')
        .controller('OrderDetailCtrl',function($scope, $http, $stateParams, orderservice){

            $scope.price = 0;
            $scope.busy = true;
            $scope.status_list = [];
            $scope.wait2 = false;           // 操作时延

            orderservice.getOrderDetail($stateParams.id).then(response => {
                $scope.order = response;
                $scope.order.status = statusDict[$scope.order.status];
                for(let book of $scope.order.carts) {
                    $scope.price += book.number * book.price;
                }
                for(let item of $scope.order.status_list) {
                    $scope.status_list.push({
                        'status': statusDict[item.status],
                        'content': item.content,
                        'time': item.time
                    })
                }
                $scope.busy = false;
            });


            // 取消订单
            $scope.cancel = function(order){
                $scope.wait2 = true;
                orderservice.cancelOrder(order.id).then(() => {
                    $scope.wait2 = false;
                    $scope.order.status = '已取消';
                    $scope.status_list.push({
                        'status': '已取消',
                        'time': Date.parse(new Date()) / 1000
                    })
                })
            };

            // 确认收货
            $scope.receipt = function(order){
                order.wait2 = true;
                orderservice.receiptOrder(order.id).then(() => {
                    $scope.status_list.push({
                        'status': '已收货',
                        'time': Date.parse(new Date()) / 1000
                    });
                    $scope.order.status = '待评价';
                });
            };
        });


})();