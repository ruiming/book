(function(){
    "use strict";
    angular
        .module('index')
        .controller('OrdersCtrl',function($scope, $http, $stateParams, orderservice) {

            $scope.message = false;
            $scope.busy = true;
            $scope.wait = false;        // 取消订单提示
            $scope.type = $stateParams.status;

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
                orderservice.getReturnOrder().then(response => {
                    $scope.orders_return = response;
                    for(let order of $scope.orders_return) {
                        order.status = statusDict[order.status];
                    }
                });
            }

            // 获取订单
            orderservice.getOrder($stateParams.status).then(response => {
                $scope.orders = response;
                for(order of $scope.orders) {
                    order.status = statusDict[order.status];
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
                orderservice.cancelOrder(order.id).then(() => {
                    order.wait2 = false;
                    order.status = '已取消'
                });
            };

            // 确认收货    waiting -> commenting
            $scope.receipt = function(order){
                order.wait2 = true;
                orderservice.receiptOrder(order.id).then(() => {
                    order.wait2 = false;
                    order.status = '待评价'
                });
            };

        });

})();