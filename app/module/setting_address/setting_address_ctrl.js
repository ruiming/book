(function() {
    'use strict';

    angular
        .module('index')
        .controller('AddressCtrl', AddressCtrl);

    AddressCtrl.$inject = ['$state', 'userservice'];

    function AddressCtrl($state, userservice) {
        let vm = this;

        vm.edit = edit;
        vm.back = back;

        getUserAddress();

        function getUserAddress() {
            userservice.getUserAddress().then(response => {
                vm.address = response;
            });
        }

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
