(function(){
    "use strict";

    angular
        .module('index')
        .controller('BookInfoCtrl', function($http, $scope, bookservice, $stateParams) {
            $scope.busy = true;

            bookservice.getBookDetail($stateParams.isbn).then(response => {
                $scope.book = response;
                $scope.busy = false;
            });
        });

})();
