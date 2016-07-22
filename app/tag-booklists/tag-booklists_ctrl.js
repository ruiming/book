routeApp.controller('TagBooklistsCtrl', function($scope, BL, $stateParams){

    // 获取指定标签的书单
    var url = host + '/booklist';
    var params = {
        tag: $stateParams.tag,
        page: 1
    };
    $scope.booklists = new BL(url,params);
    
    // 时间优先
    $scope.timeOrder = function(){
        var url = host + '/booklist';
        var params = {
            tag: $stateParams.tag,
            page: 1,
            type: "time"
        };
        $scope.booklists = new BL(url,params);
        $scope.booklists.nextPage();
    };

    // 收藏优先
    $scope.collectOrder = function(){
        var url = host + '/booklist';
        var params = {
            tag: $stateParams.tag,
            page: 1,
            type: "collect"
        };
        $scope.booklists = new BL(url,params);
        $scope.booklists.nextPage();
    };

});
