routeApp.controller('IndexCtrl',function($scope, $http) {

    $scope.myInterval = 5000;
    $scope.noWrapSlides = false;
    $scope.active = 0;

    // 刷新微信缓存
    $scope.token = sessionStorage.token;
    $scope.user_id = sessionStorage.user_id;
    $scope.fuck = function() {
        location.href = "http://bookist.org?token=" + $scope.token + "&user_id=" + $scope.user_id + "#/?fuckWechat=true";
    };

    // 获取书籍推荐
    if(sessionStorage.books != undefined){
        $scope.books = JSON.parse(sessionStorage.books);
    }
    else {
        $http({
            method: 'GET',
            url: host + '/pop_book'
        }).success(function(response){
            $scope.books = response;
            for(var i=0;i<$scope.books.length;i++){
                $scope.books[i].star = Math.ceil($scope.books[i].rate/2);
            }
            sessionStorage.books = JSON.stringify($scope.books);
        });
    }

    // 获取热门书单
    if(sessionStorage.booklists != undefined){
        $scope.booklists = JSON.parse(sessionStorage.booklists);
    }
    else {
        $http({
            method: 'GET',
            url: host + '/booklist',
            params: {
                type: "hot"
            }
        }).success(function(response){
            $scope.booklists = response;
            sessionStorage.booklists = JSON.stringify($scope.booklists);
        });
    }

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
