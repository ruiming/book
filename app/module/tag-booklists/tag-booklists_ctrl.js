routeApp.controller('TagBooklistsCtrl', function($scope, BL, $stateParams){

    // todo 获取指定标签的书单
    var url = host + '/booklist';
    var params = {
        tag: $stateParams.tag,
        page: 1
    };
    $scope.booklists = new BL(url,params);
    
    // todo 时间优先
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

    // todo 收藏优先
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
