routeApp.controller('RecommendMoreCtrl',function($scope, BL) {

    // todo 获取更多推荐书籍
    var url = host + '/book';
    var params = {
        type: "user",
        page: 1
    };
    $scope.books = new BL(url, params);
    
});
