(function(){
    "use strict";

    angular
        .module('index')
        .controller('CollectBookListsCtrl', function($http, $scope, userservice){

            $scope.busy = true;
            userservice.getUserCollect('booklist').then((response) => {
                $scope.booklists = response;
                $scope.busy = false;
            });

        });

})();
