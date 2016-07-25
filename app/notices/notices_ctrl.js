(function() {
    "use strict";

    angular
        .module('index')
        .controller('NoticesCtrl', NoticesCtrl);

    NoticesCtrl.$inject = ['userservice'];

    function userservice() {
        let vm = this;

        getUserNotices();

        function getUserNotices() {
            userservice.getUserNotices().then(response => {
                vm.notices = response;
            });
        }
    }
})();
