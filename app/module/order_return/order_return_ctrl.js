(function() {
    'use strict';

    angular
        .module('index')
        .controller('OrderReturnCtrl', OrderReturnCtrl);

    OrderReturnCtrl.$inject = ['orderservice', 'order'];

    function OrderReturnCtrl(orderservice, order) {
        let vm = this;
        vm.order = order;
        console.log(order);
    }
}());
