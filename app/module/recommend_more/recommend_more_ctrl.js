routeApp.controller('RecommendMoreCtrl',function($scope, BL) {

    // 获取更多推荐书籍
    var url = host + '/pop_book';
    var params = {
        page: 1
    };
    $scope.books = new BL(url, params);
    
});
