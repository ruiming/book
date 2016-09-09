(function(){
    'use strict';

    angular
        .module('index')
        .controller('OrdersAftersalesDetailCtrl', OrdersAftersalesDetailCtrl);

    OrdersAftersalesDetailCtrl.$inject = ['orderservice', 'aftersale'];

    function OrdersAftersalesDetailCtrl(orderservice, aftersale) {
        let vm = this;
        vm.cancel = cancelReturn;

        console.log(aftersale);
        vm.canceled = false;
        vm.aftersale = aftersale;

        function cancelReturn(aftersale) {
            return orderservice.cancelAftersale(aftersale.billing_id, aftersale.id)
                .then(() => {
                    aftersale.is_done = true;
                });
        }

    }
})();
