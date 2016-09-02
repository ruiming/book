(function(){
    'use strict';

    angular
        .module('index')
        .controller('OrdersAftersalesCtrl', OrdersAftersalesCtrl);

    OrdersAftersalesCtrl.$inject = ['orderservice', 'aftersales'];

    function OrdersAftersalesCtrl(orderservice, aftersales) {
        let vm = this;
        vm.cancel = cancelReturn;

        vm.canceled = false;
        vm.aftersales = aftersales;

        function cancelReturn(billing_id, afterselling_id) {
            return orderservice.cancelAftersale(billing_id, afterselling_id)
                .then(response => response);
        }

    }
})();
