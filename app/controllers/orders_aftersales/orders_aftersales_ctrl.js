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
        console.log(vm.aftersales.length);

        function cancelReturn(aftersale) {
            return orderservice.cancelAftersale(aftersale.billing_id, aftersale.id)
                .then(() => {
                    vm.aftersales.splice(vm.aftersales.indexOf(aftersale), 1);
                });
        }

    }
})();
