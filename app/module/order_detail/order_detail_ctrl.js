(function(){
    'use strict';

    angular
        .module('index')
        .controller('OrderDetailCtrl', OrderDetailCtrl);

    OrderDetailCtrl.$inject = ['orderservice', 'order'];

    function OrderDetailCtrl(orderservice, order) {
        let vm = this;
        vm.price = 0;
        vm.status_list = [];

        vm.cancel = cancel;

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
