(function(){
    'use strict';

    angular
        .module('index')
        .controller('SettingsCtrl', SettingsCtrl);

    function SettingsCtrl(user, tokenInjector, $location){
        let vm = this;
        vm.user = user;
        vm.logout = logout;

        function logout() {
            tokenInjector.setAuth(undefined);
            $location.path('#/').replace();
        }
    }
})();

