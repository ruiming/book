(function(){
    "use strict";
    angular
        .module('index')
        .controller('SettingsCtrl', function($http, $scope, userservice){

            userservice.getUserInfo().then(response => {
                $scope.user = response;
            });
        });

})();