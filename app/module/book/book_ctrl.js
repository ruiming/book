routeApp.controller('BookCtrl', function($scope, $http, $stateParams) {
    
    $scope.more = false;            // 默认不加载更多书籍信息介绍
    $scope.commentBox = false;      // 默认不显示评论框
    $scope.auth = true;             // 是否已登录
    $scope.busy = true;             // Loading

    // 根据ISBN号获取图书信息(包含评论和标签)
    $http({
        method: 'GET',
        url: host + '/book',
        params: {
            isbn: $stateParams.isbn
        }
    }).success(function(response){
        $scope.book = response;
        $scope.book.star = Math.ceil(response.rate/2);
        $scope.busy = false;
    });
    

    // todo 获取用户信息
    $http({
        method: 'GET',
        url: host + '/user'
    }).success(function(response){
        $scope.user = response;
        $scope.auth = true;
    });

    // todo 收藏图书
    $scope.collect = function() {
        $http({
            method: 'POST',
            url: host + '/collect',
            data: {
                isbn: $stateParams.isbn,
                type: "book"
            }
        }).success(function () {
            $scope.book.collected = !$scope.book.collected;
        });
    };

    // todo 获取购买此书的人也购买的书籍
    $http({
        method: 'GET',
        url: host + '/book',
        params: {
            isbn: $stateParams.isbn,
            type: "similarity"
        }
    }).success(function(response){
        $scope.booksBought = response.books;
        for(var i=0;i<$scope.booksBought.length;i++){
            $scope.booksBought[i].star = Math.ceil($scope.booksBought[i].rate/2);
        }
    });
    
    // 获取该书被收录的书单
    $http({
        method: 'GET',
        url: host + '/booklist',
        params: {
            isbn: $stateParams.isbn
        }
    }).success(function(response){
        $scope.booklists = response;
    });

    // todo 顶
    $scope.up = function(comment){
        $http({
            method: 'POST',
            url: host + '/comment',
            data: {
                id: comment.id,
                action: "up"
            }
        }).success(function(){
            comment.up_already = !comment.up_already;
            comment.down_already = false;
            comment.up = response.up;
            comment.down = response.down;
        });
    };

    // todo 踩
    $scope.down = function(comment){
        comment.down_already = !comment.down_already;
        comment.up_already = false;
        $http({
            method: 'POST',
            url: host + '/comment',
            data: {
                id: comment.id,
                action: "down"
            }
        }).success(function(){
            comment.down_already = !comment.down_already;
            comment.up_already = false;
            comment.up = response.up;
            comment.down = response.down;
        });
    };
    
    // 评星鼠标悬浮函数
    $scope.hoveringOver = function(value) {
        $scope.overStar = value;
    };
    
});
