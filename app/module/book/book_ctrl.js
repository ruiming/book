routeApp.controller('BookCtrl', function($scope, $http, $stateParams, TEMP) {
    
    $scope.more = false;            // 默认不加载更多书籍信息介绍
    $scope.busy = true;             // 页面加载动画Loading
    $scope.wait = false;            // 发表评论wait
    $scope.wait2 = false;           // 收藏图书wait
    $scope.wait3 = false;           // 加入购物车wait
    $scope.wait4 = false;           // 加入购物车提醒延迟
    $scope.wait5 = false;           // 收藏提醒延迟
    $scope.wait6 = false;           // 取消收藏延迟
    $scope.wait7 = false;           // 发布评论延迟
    $scope.required = true;         // 必填
    $scope.content = "";             // 初始评论
    $scope.star = 5;                 // 默认星星数

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
            $scope.wait4 = true;
            window.setTimeout(function() {
                $scope.$apply(function() {
                    $scope.wait4 = false;
                });
            }, 1500);
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
        for (var i=0; i< response.comments.length; i++){
            $scope.book.comments[i].star = Math.ceil($scope.book.comments[i].star/2);
        }
        TEMP.setDict({title: $scope.book.title});
        $scope.busy = false;
    });
    

    // todo 获取用户信息
    $http({
        method: 'GET',
        url: host + '/user_info'
    }).success(function(response){
        $scope.user = response;
    });

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
            if($scope.book.collect_already) {
                $scope.wait5 = true;
            }
            else {
                $scope.wait6 = true;
            }
            window.setTimeout(function() {
                $scope.$apply(function() {
                    $scope.wait5 = false;
                    $scope.wait6 = false;
                });
            }, delay);
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
            if(comment.down_already) comment.down--;
            comment.up_already = !comment.up_already;
            comment.down_already = false;
            if(comment.up_already)  comment.up++;
            else comment.up--;
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
            if(comment.up_already) comment.up--;
            comment.down_already = !comment.down_already;
            comment.up_already = false;
            if(comment.down_already)  comment.down++;
            else comment.down--;
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
                content: $scope.content,
                isbn: $stateParams.isbn,
                star: $scope.star*2
            }
        }).success(function(response){
            $scope.commentBox = false;
            $scope.wait7 = true;
            response.user = {
                avatar: $scope.user.avatar,
                username: $scope.user.username
            };
            response.star = response.star/2;
            $scope.book.commenters ++;
            $scope.book.comments.push(response);
            $scope.wait = false;
            $scope.content = "";
            window.setTimeout(function() {
                $scope.$apply(function() {
                    $scope.wait7 = false;
                });
            }, delay);
        });
    };
    
});
