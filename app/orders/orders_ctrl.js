(function(){
    "use strict";
    angular
        .module('index')
        .controller('OrdersCtrl',function($stateParams, orderservice) {

            let vm = this;
            vm.WAIT_OPERATING = false;
            vm.type = $stateParams.status;
            let status = ['pending', 'all', 'commenting', 'waiting', 'return', 'done'];

            vm.cancelReturn = cancelReturn;
            vm.cancel = cancel;
            vm.receipt = receipt;
            
            getOrder();

            if(status.indexOf(vm.type) === -1) {
                history.back();
            }
            else if(vm.type === 'return') {
                orderservice.getReturnOrder().then(response => {
                    vm.orders_return = response;
                    for(let order of vm.orders_return) {
                        order.status = statusDict[order.status];
                    }
                });
            }

            function getOrder() {
                orderservice.getOrder($stateParams.status).then(response => {
                    vm.orders = response;
                    for(order of vm.orders) {
                        order.status = statusDict[order.status];
                    }
                });
            }

            // TODO 取消售后
            function cancelReturn(order) {
                order.WAIT_OPERATING = true;
            }

            function cancel(order) {
                order.WAIT_OPERATING = true;
                orderservice.cancelOrder(order.id).then(() => {
                    order.WAIT_OPERATING = false;
                    order.status = '已取消'
                });
            }

            function receipt(order){
                order.WAIT_OPERATING = true;
                orderservice.receiptOrder(order.id).then(() => {
                    order.WAIT_OPERATING = false;
                    order.status = '待评价'
                });
            }

        });
})();
