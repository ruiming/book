(function(){
    "use strict";

    angular
        .module('index')
        .controller('MeCtrl',function($scope, $http, userservice) {

            userservice.getUserInfo().then(response => {
                $scope.user = response;
            });

        });

})();