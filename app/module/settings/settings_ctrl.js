(function(){
    'use strict';

    angular
        .module('index')
        .controller('SettingsCtrl', SettingsCtrl);

    SettingsCtrl.$inject = ['user'];

    function SettingsCtrl(users){
        let vm = this;
        vm.user = user;
    }
})();

