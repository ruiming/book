(function(){

    "use strict";

    angular
        .module('index')
        .controller('SettingsCtrl', SettingsCtrl);

    SettingsCtrl.$inject = ['userservice'];

    function SettingsCtrl(userservice){
        let vm = this;

        getUserInfo();

        function getUserInfo() {
            userservice.getUserInfo().then(response => {
                vm.user = response;
            });
        }
    }
})();

