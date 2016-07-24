(function() {
    "use strict";

    angular
        .module('index')
        .controller('NoticesCtrl', function(userservice){

            getUserNotices();

            function getUserNotices() {
                userservice.getUserNotices().then(response => {
                    vm.notices = response;
                });
            }

        });
})();
