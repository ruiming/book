(function() {
    "use strict";

    angular
        .module('index')
        .controller('AddressCtrl', function ($state, userservice) {
            let vm = this;
            vm.WAIT_LOADING = true;

            vm.edit = edit;
            vm.back = back;

            getUserAddress();

            function getUserAddress() {
                userservice.getUserAddress().then(response => {
                    vm.address = response;
                    vm.WAIT_LOADING = false;
                });
            }

            function edit() {
                vm.edit = function(){
                    userservice.setAddress(this.x);
                    $state.go('AddressAdd');
                };
            }

            function back() {
                history.back();
            }
        });
})();