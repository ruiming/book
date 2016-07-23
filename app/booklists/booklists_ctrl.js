(function() {
    "use strict";

    angular
        .module('index')
        .controller('BooklistsCtrl', function ($scope, $http, booklistservice, tagservice) {

            let url = host + '/booklist';
            let params = { type: "all", page: 1 };
            $scope.booklists = new booklistservice.getBoolists(url, params);

            tagservice.getHotTags().then(response => {
                $scope.tags = response;
            });

            $scope.timeOrder = function () {
                let params = { type: "time", page: 1 };
                $scope.booklists = new booklistservice.getBoolists(url, params);
                $scope.booklists.nextPage();
            };

            $scope.collectOrder = function () {
                let params = { type: "collect", page: 1 };
                $scope.booklists = new booklistservice.getBoolists(url, params);
                $scope.booklists.nextPage();
            };
        });
})();