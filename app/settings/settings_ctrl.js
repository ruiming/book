(function(){
    "use strict";
    angular
        .module('index')
        .controller('SettingsCtrl', function(userservice){

            let vm = this;

            userservice.getUserInfo().then(response => {
                vm.user = response;
            });
        });

})();
