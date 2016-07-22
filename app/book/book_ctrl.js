angular
    .module('index')
    .controller('BookCtrl', function($scope, $http, $stateParams, TEMP) {
    // todo 在苹果下加入购物车，收藏出现延迟问题
    $scope.more = false;            // 默认不加载更多书籍信息介绍
    $scope.busy = true;             // 页面加载动画Loading
    $scope.wait = false;            // 发表评论wait
    $scope.wait2 = false;           // 收藏图书wait
    $scope.wait3 = false;           // 加入购物车wait
    $scope.required = true;         // 必填
    $scope.content = "";            // 初始评论
    $scope.star = 5;                // 默认星星数

    // 加入购物车
    $scope.addCart = function(){
        $scope.wait3 = true;
        $http({
            method: 'POST',
            url: host + '/cart',
            data: {
                isbn: $stateParams.isbn
            }
        }).success(function(){
            $scope.wait3 = false;
        });
    };

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
        for (var i in $scope.book.comments){
            if($scope.book.comments.hasOwnProperty(i)){
                $scope.book.comments[i].star = Math.ceil($scope.book.comments[i].star/2);
            }
        }
        TEMP.setDict({title: $scope.book.title});
        $scope.busy = false;
    });

    // 获取用户信息,sessionStorage
    if(angular.isUndefined(sessionStorage.user)) {
        $http({
            method: 'GET',
            url: host + '/user_info'
        }).success(function(response){
            $scope.user = response;
            sessionStorage.user = angular.toJson(response);
        });
    }
    else {
        $scope.user = angular.fromJson(sessionStorage.user);
    }

    // 收藏图书
    $scope.collect = function() {
        $scope.wait2 = true;
        $http({
            method: 'POST',
            url: host + '/collect',
            data: {
                isbn: $stateParams.isbn,
                type: "book"
            }
        }).success(function () {
            $scope.book.collect_already = !$scope.book.collect_already;
            $scope.wait2 = false;
        });
    };

    // 获取购买此书的人也购买的书籍
    $http({
        method: 'GET',
        url: host + '/similar_book',
        params: {
            isbn: $stateParams.isbn
        }
    }).success(function(response){
        $scope.booksBought = response;
        for(var i in $scope.booksBought){
            if($scope.booksBought.hasOwnProperty(i)){
                $scope.booksBought[i].star = Math.ceil($scope.booksBought[i].rate/2);
            }
        }
        console.log($scope.booksBought);
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
        console.log($scope.booklists.length);
    });

    // 顶
    $scope.up = function(comment){
        $http({
            method: 'PUT',
            url: host + '/comment',
            data: {
                id: comment.id,
                type: "up"
            }
        }).success(function(){
            if(comment.down_already) {
                comment.down--;
            }
            comment.up_already = !comment.up_already;
            comment.down_already = false;
            if(comment.up_already)  {
                comment.up++;
            }
            else {
                comment.up--;
            }
        });
    };

    // 踩
    $scope.down = function(comment){
        $http({
            method: 'PUT',
            url: host + '/comment',
            data: {
                id: comment.id,
                type: "down"
            }
        }).success(function(){
            if(comment.up_already) {
                comment.up--;
            }
            comment.down_already = !comment.down_already;
            comment.up_already = false;
            if(comment.down_already)  {
                comment.down++;
            }
            else {
                comment.down--;
            }
        });
    };

    // 评论
    $scope.postComment = function(){
        if(!this.commentForm.content.$valid) return;
        $scope.wait = true;
        $http({
            method: 'POST',
            url: host + '/comment',
            data: {
                content: this.content,
                isbn: $stateParams.isbn,
                star: $scope.star*2
            }
        }).success(function(response){
            $scope.commentBox = false;
            response.user = {
                avatar: $scope.user.avatar,
                username: $scope.user.username
            };
            response.star = response.star/2;
            $scope.book.commenters ++;
            $scope.book.comments.push(response);
            $scope.wait = false;
            $scope.content = "";
        });
    };
});
