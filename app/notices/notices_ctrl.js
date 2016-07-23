(function() {
    "use strict";

    angular
        .module('index')
        .controller('NoticesCtrl', function($http, $scope, userservice){

            $scope.busy = true;

            userservice.getUserNotices().then(response => {
                $scope.notices = response;
                $scope.busy = false;
            });

        });

});