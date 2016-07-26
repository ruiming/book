(function(){
    "use strict";

    angular
        .module('index')
        .controller('Cart2OrderCtrl', function($http, $location, userservice, orderservice){
            let vm = this;
            vm.no_address = true;      // 地址必须有
            vm.cart_list = '';
            vm.order = {　number: 0, price: 0　};
            vm.make = make;

            /**
             * 从orderservice获取订单数据
             */
            vm.books = orderservice.getStore();
            for(let book of vm.books) {
                vm.order.number += book.number;
                vm.order.price += book.price * book.number;
                vm.cart_list += vm.cart_list ? ',' + book.id : book.id;
            }
            getUserDefaultAddress();


            // TODO 等待地址问题修复
            function getUserDefaultAddress() {
                userservice.getUserDefaultAddress().then(response => {
                    vm.x = response[0];
                    vm.no_address = false;
                }).catch(() => {
                    vm.no_address = true;
                });
            }

            // TODO　等待地址问题修复
            function make() {
                return orderservice.makeOrder(vm.cart_list, vm.x.id).then((response) => {
                    $location.path('/order/'+response+'/detail').replace();
                });
            }
        });
})();