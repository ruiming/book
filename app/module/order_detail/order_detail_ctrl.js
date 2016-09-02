(function(){
    'use strict';

    angular
        .module('index')
        .controller('OrderDetailCtrl', OrderDetailCtrl);

    OrderDetailCtrl.$inject = ['orderservice', 'order', '$state'];

    function OrderDetailCtrl(orderservice, order, $state) {
        let vm = this;
        vm.price = 0;
        vm.status_list = [];

        vm.cancel = cancel;
        vm.toReturn = toReturn;

        vm.order = order;
        vm.order.status = statusDict[vm.order.status];
        for(let book of vm.order.carts) {
            vm.price += book.price_sum;
        }
        for(let item of vm.order.status_list) {
            vm.status_list.push({
                'status': statusDict[item.status],
                'content': item.content,
                'time': item.time
            });
        }

        function toReturn(item) {
            orderservice.setAfterSales(item);
            console.log(orderservice.getAfterSales());
            $state.go('aftersales');
        }

        function cancel(order) {
            return orderservice.cancelOrder(order.id).then(() => {
                vm.order.status = '已取消';
                vm.status_list.push({
                    'status': '已取消',
                    'time': Date.parse(new Date()) / 1000
                });
            });
        }
    }
})();
