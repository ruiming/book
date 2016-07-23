(function(){
    "use strict";

    angular
        .module('index')
        .controller('RecommendMoreCtrl',function($scope, BL, bookservice) {

            // 获取更多推荐书籍
            var url = host + '/pop_book';
            var params = {
                page: 1
            };
            $scope.books = new bookservice.getBooks(url, params);
            $scope.books.nextPage();

        });
})();