(function(){
    "use strict";

    angular
        .module('index')
        .controller('MeCtrl',function(userservice) {
            let vm = this;
            getUserInfo();

            function getUserInfo() {
                userservice.getUserInfo().then(response => {
                    vm.user = response;
                });
            }

        });

})();
