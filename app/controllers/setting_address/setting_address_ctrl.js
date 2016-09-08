(function() {
    'use strict';

    angular
        .module('index')
        .controller('AddressCtrl', AddressCtrl);

    AddressCtrl.$inject = ['$state', 'userservice', 'address'];

    function AddressCtrl($state, userservice, address) {
        let vm = this;
        vm.address = address;

        vm.edit = edit;
        vm.back = back;

        function edit(x) {
            vm.edit = function(){
                userservice.setAddress(x);
                $state.go('AddressAdd');
            };
        }

        function back() {
            history.back();
        }
    }
})();
