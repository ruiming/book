(function(){
    "use strict";

    angular
        .module('index')
        .controller('TagsCtrl', function($scope, $http, tagservice){

            $scope.busy = true;

            tagservice.getAllTags().then(response => {
                $scope.busy = false;
                $scope.allTags = response;
            });

        });


})();