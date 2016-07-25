(function(){
    "use strict";

    angular
        .module('index')
        .controller('OrderDetailCtrl', OrderDetailCtrl);

    OrderDetailCtrl.$inject = ['$stateParams', 'orderservice'];

    function OrderDetailCtrl($stateParams, orderservice){
        let vm = this;
        vm.price = 0;
        vm.status_list = [];
        vm.WAIT_OPERATING = false;

        vm.cancel = cancel;
        vm.receipt = receipt;

        getOrderDetail();

        function getOrderDetail() {
            orderservice.getOrderDetail($stateParams.id).then(response => {
                vm.order = response;
                vm.order.status = statusDict[vm.order.status];
                for(let book of vm.order.carts) {
                    vm.price += book.number * book.price;
                }
                for(let item of vm.order.status_list) {
                    vm.status_list.push({
                        'status': statusDict[item.status],
                        'content': item.content,
                        'time': item.time
                    })
                }
            });
        }


        function cancel(order) {
            vm.WAIT_OPERATING = true;
            orderservice.cancelOrder(order.id).then(() => {
                vm.WAIT_OPERATING = false;
                vm.order.status = '已取消';
                vm.status_list.push({
                    'status': '已取消',
                    'time': Date.parse(new Date()) / 1000
                })
            })
        }

        function receipt(order) {
            order.WAIT_OPERATING = true;
            orderservice.receiptOrder(order.id).then(() => {
                order.WAIT_OPERATING = true;
                vm.status_list.push({
                    'status': '已收货',
                    'time': Date.parse(new Date()) / 1000
                });
                vm.order.status = '待评价';
            });
        }
    }
})();
