angular
    .module('index')
    .controller('IndexCtrl',function($scope, $http) {

    $scope.myInterval = 5000;
    $scope.noWrapSlides = false;
    $scope.active = 0;

        $http({
            method: 'GET',
            url: host + '/pop_book'
        }).success(function(response){
            $scope.books = response;
            for(var i=0;i<$scope.books.length;i++){
                $scope.books[i].star = Math.ceil($scope.books[i].rate/2);
            }
        });

        $http({
            method: 'GET',
            url: host + '/booklist',
            params: {
                type: "hot"
            }
        }).success(function(response){
            $scope.booklists = response;
        });

    // 获取活动轮播
    if(sessionStorage.slides != undefined) {
        $scope.slides = JSON.parse(sessionStorage.slides);
    }
    else {
        $http({
            method: 'GET',
            url: host + '/slides'
        }).success(function(response){
            $scope.slides = response;
            sessionStorage.slides = JSON.stringify($scope.slides);
        });
    }

});
