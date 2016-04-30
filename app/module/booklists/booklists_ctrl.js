routeApp.controller('BooklistsCtrl',function($scope, $http, BL) {
    
    // 获取热门书单标签
    $http({
        method: 'GET',
        url: host + '/tags',
        params: {
            type: "hot"
        }
    }).success(function(response){
        $scope.tags = response;
    });

    // 获取书单,获取默认排序的十个书单
    var url = host + '/booklist';
    var params = {
        type: "all",
        page: 1
    };
    $scope.booklists = new BL(url,params);


    // 时间优先
    $scope.timeOrder = function(){
        var url = host + '/booklist';
        var params = {
            type: "time",
            page: 1
        };
        $scope.booklists = new BL(url,params);
        $scope.booklists.nextPage();
    };

    // 收藏优先
    $scope.collectOrder = function(){
        var url = host + '/booklist';
        var params = {
            type: "collect",
            page: 1
        };
        $scope.booklists = new BL(url, params);
        $scope.booklists.nextPage();
    };


});
