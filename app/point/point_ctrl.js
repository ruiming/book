(function(){
    "use strict";

    angular
        .module('index')
        .controller('PointCtrl', function($http, $scope, userservice){

            $scope.busy = true;

            userservice.getUserPoints().then(response => {
                $scope.points = response;
                $scope.busy = false;
            });

        });

})();