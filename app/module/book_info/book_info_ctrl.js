routeApp.controller('BookInfoCtrl', function($http, $scope, $stateParams){

    $scope.busy = true;
    
    // 获取图书信息(包含评论和标签)
    $http({
        method: 'GET',
        url: host + '/book',
        params: {
            isbn: $stateParams.isbn,
            type: "detail"
        }
    }).success(function(response){
        $scope.book = response;
        $scope.busy = false;
    });
    
});
