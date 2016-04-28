routeApp.controller('IndexCtrl',function($scope, $http) {

    $scope.myInterval = 5000;
    $scope.noWrapSlides = false;
    $scope.active = 0;

    // 获取活动轮播
    $http({
        method: 'GET',
        url: host + '/slides'
    }).success(function(response){
        $scope.slides = response;
    });

    // todo 获取书籍推荐
    $http({
        method: 'GET',
        url: host + '/books',
        params: {
            
        }
    }).success(function(response){
        $scope.books = response;
        for(var i=0;i<$scope.books.length;i++){
            $scope.books[i].star = Math.ceil($scope.books[i].rate/2);
        }
    });

    // 获取热门书单
    $http({
        method: 'GET',
        url: host + '/booklist',
        params: {
            type: "hot"
        }
    }).success(function(response){
        $scope.booklists = response;
    });
    
});
