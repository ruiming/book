angular
    .module('index')
    .controller('BooklistsCtrl',function($scope, $http, BL) {
    var url = host + '/booklist';
    var params = {
        type: "all",
        page: 1
    };

    // 获取书单,获取默认排序的十个书单
    $scope.booklists = new BL(url,params);

    // 获取热门书单标签并缓存
    if(sessionStorage.tags != undefined) {
        $scope.tags = angular.fromJson(sessionStorage.tags);
    }
    else {
        $http({
            method: 'GET',
            url: host + '/tags',
            params: {
                type: "hot"
            }
        }).success(function(response){
            $scope.tags = response;
            sessionStorage.tags = angular.toJson($scope.tags);
        });
    }

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
