(function(){
    "use strict";

    angular
        .module('index')
        .controller('MeCtrl', MeCtrl);

    MeCtrl.$inject = ['userservice'];

    function MeCtrl() {
        let vm = this;
        getUserInfo();

        function getUserInfo() {
            userservice.getUserInfo().then(response => {
                vm.user = response;
            });
        }
    }
})();
