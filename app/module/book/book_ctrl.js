routeApp.controller('BookCtrl', function($scope, $http, $stateParams, TEMP) {
    
    $scope.more = false;            // 默认不加载更多书籍信息介绍
    $scope.commentBox = false;      // 默认不显示评论框
    $scope.auth = true;             // 是否已登录
    $scope.busy = true;             // Loading
    $scope.star = 5;
    $scope.wait = false;            // 发表评论wait
    $scope.wait2 = false;           // 收藏图书wait
    $scope.required = true;

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
    

    // 获取用户信息
    $http({
        method: 'GET',
        url: host + '/user_info'
    }).success(function(response){
        $scope.user = response;
        $scope.auth = true;
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
                content: this.content,
                isbn: $stateParams.isbn,
                star: $scope.star*2
            }
        }).success(function(response){
            response.user = {
                avatar: $scope.user.avatar,
                username: $scope.user.username
            };
            response.star = response.star/2;
            $scope.book.commenters ++;
            $scope.book.comments.unshift(response);
            $scope.wait = false;
        });
    };

    // 评星鼠标悬浮函数
    $scope.hoveringOver = function(value) {
        $scope.star = value;
    };
    
});
