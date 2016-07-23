(function(){
    "use strict";

    angular
        .module('index')
        .controller('PopularMoreCtrl',function($scope, BL, booklistservice) {
            let url = host + '/booklist';
            let params = { type: "all", page: 1 };
            $scope.booklists = new booklistservice.getBooklists(url, params);
            $scope.booklists.nextPage();

        });
})();