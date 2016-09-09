(function(){
    'use strict';

    angular
        .module('index')
        .controller('OrdersAftersalesDetailCtrl', OrdersAftersalesDetailCtrl);

    OrdersAftersalesDetailCtrl.$inject = ['orderservice', 'aftersale', 'order', '$stateParams'];

    function OrdersAftersalesDetailCtrl(orderservice, aftersale, order, $stateParams) {
        let vm = this;
        vm.cancel = cancelReturn;

        vm.canceled = false;
        vm.aftersale = aftersale;
        vm.order = order;

        function cancelReturn(aftersale) {
            return orderservice.cancelAftersale($stateParams.orderid, $stateParams.aftersellingid)
                .then(() => {
                    aftersale.is_done = true;
                });
        }

    }
})();
