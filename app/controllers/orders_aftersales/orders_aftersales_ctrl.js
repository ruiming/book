(function(){
    'use strict';

    angular
        .module('index')
        .controller('OrdersAftersalesCtrl', OrdersAftersalesCtrl);

    OrdersAftersalesCtrl.$inject = ['orderservice', 'aftersales'];

    function OrdersAftersalesCtrl(orderservice, aftersales) {
        let vm = this;
        vm.cancel = cancelReturn;

        vm.aftersales = aftersales;

        function cancelReturn(aftersale) {
            return orderservice.cancelAftersale(aftersale.billing_id, aftersale.id)
                .then(() => {
                    aftersale.is_done = true;
                });
        }

    }
})();
