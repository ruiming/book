(function() {
    'use strict';

    angular
        .module('index')
        .controller('OrderReturnCtrl', OrderReturnCtrl);

    OrderReturnCtrl.$inject = ['orderservice', '$state'];

    function OrderReturnCtrl(orderservice, $state) {
        let vm = this;
        vm.getSelect = getSelect;
        vm.handel = handel;
        vm.book = orderservice.getStore();
        vm.form = {
            id: vm.book.id,
            isbn: vm.book.book.isbn,
            number: vm.book.number
        };
        function getSelect(max) {
            let result = [];
            for(let i=1; i<=max; i++) {
                result.push(i);
            }
            return result;
        }
        function handel(form) {
            return orderservice.postAfterSales(form).then(response => {
                // TODO response.id
                $state.go()
            });
        }
    }
}());
