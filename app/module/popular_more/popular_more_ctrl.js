routeApp.controller('PopularMoreCtrl',function($scope, BL) {

    // 获取更多热门书单
    var url = host + '/booklist';
    var params = {
        type: "hot",
        page: 1
    };
    $scope.booklists = new BL(url,params);

});
