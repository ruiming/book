(function() {
    "use strict";

    angular
        .module('index')
        .controller('AddressCtrl', function ($http, $scope, $state, User, userservice) {

            $scope.wait = true;

            userservice.getUserAddress().then(response => {
                $scope.address = response;
                $scope.wait = false;
            });

            $scope.edit = function(){
                userservice.setAddress(this.x);
                $state.go('AddressAdd');
            };

            // 返回上层
            $scope.back = function() {
                history.back();
            };
        });
})();