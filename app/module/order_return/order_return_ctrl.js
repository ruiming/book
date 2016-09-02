(function() {
    'use strict';

    angular
        .module('index')
        .controller('OrderReturnCtrl', OrderReturnCtrl);

    OrderReturnCtrl.$inject = ['orderservice'];

    function OrderReturnCtrl(orderservice) {
        let vm = this;
        vm.book = orderservice.getAfterSales();
    }
}());
