routeApp.controller('CollectBookListsCtrl', function($http, $scope){

    $scope.busy = true;

    // todo 获取全部收藏书单
    $http({
        method: 'GET',
        url: host + '/collect',
        params: {
            type: "booklist"
        }
    }).success(function(response){
        $scope.booklists = response;
        $scope.busy = false;
    });
});
