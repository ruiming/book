(function(){
    'use strict';

    angular
        .module('index')
        .controller('OrdersCtrl', OrdersCtrl);

    OrdersCtrl.$inject = ['$stateParams', 'orderservice', 'orders'];

    function OrdersCtrl($stateParams, orderservice, orders) {
        let vm = this;
        vm.type = $stateParams.status;
        vm.orders = orders;
        let status = ['pending', 'all', 'creating', 'waiting', 'received', 'afterselling'];

        vm.cancelReturn = cancelReturn;
        vm.cancel = cancel;


        if(status.indexOf(vm.type) === -1) {
            history.back();
        } else {
            vm.type2 = statusDict[vm.type];
        }

        // TODO 取消售后
        function cancelReturn(order) {

        }

        function cancel(order) {
            return orderservice.cancelOrder(order.id).then(() => {
                order.status = '已取消';
            });
        }
    }
})();
