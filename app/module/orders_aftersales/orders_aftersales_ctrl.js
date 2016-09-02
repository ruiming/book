(function(){
    'use strict';

    angular
        .module('index')
        .controller('OrdersAftersalesCtrl', OrdersAftersalesCtrl);

    OrdersAftersalesCtrl.$inject = ['orderservice', 'aftersale'];

    function OrdersAftersalesCtrl(orderservice, aftersale) {
        let vm = this;
        vm.cancel = cancelReturn;
        vm.canceled = false;

        vm.aftersale = aftersale[0];

        function cancelReturn(billing_id, afterselling_id) {
            return orderservice.cancelAftersale(billing_id, afterselling_id)
                .then(response => response);
        }

    }
})();
