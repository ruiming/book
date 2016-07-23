(function(){
    "use strict";

    angular
        .module('index')
        .controller('BookCtrl', function($scope, $http, $stateParams, TEMP, commentservice, bookservice, userservice) {
            // todo 在苹果下加入购物车，收藏出现延迟问题
            $scope.more = false;            // 默认不加载更多书籍信息介绍
            $scope.busy = false;             // 页面加载动画Loading
            $scope.wait = false;            // 发表评论wait
            $scope.wait2 = false;           // 收藏图书wait
            $scope.wait3 = false;           // 加入购物车wait
            $scope.required = true;         // 必填
            $scope.content = "";            // 初始评论
            $scope.star = 5;                // 默认星星数

            $scope.addCart = function(){
                bookservice.addToCart($stateParams.isbn);
            };

            bookservice.getBook($stateParams.isbn).then(response => {
                $scope.book = response;
            });

            userservice.getUserInfo().then(response => {
                $scope.user = response;
            });

            $scope.collect = function() {
                bookservice.collectBook($stateParams.isbn).then(() => {
                    $scope.book.collect_already = !$scope.book.collect_already;
                })
            };

            bookservice.getSimilarBook($stateParams.isbn).then(response => {
                $scope.booksBought = response;
            });

            bookservice.getBookBelongs($stateParams.isbn).then(response => {
                $scope.booklists = response;
            });

            // 顶
            $scope.up = function(comment) {
                commentservice.up(comment.id).then(() => {
                    comment.down = comment.down_already ? --comment.down : comment.down;
                    comment.up_already = !comment.up_already;
                    comment.down_already = false;
                    comment.up = comment.up_already ? ++comment.up : --comment.up;
                });
            };

            $scope.down = function(comment) {
                commentservice.down(comment.id).then(() => {
                    comment.up = comment.up_already ? --comment.up : comment.up;
                    comment.down_already = !comment.down_already;
                    comment.up_already = false;
                    comment.down = comment.down_already ? ++comment.down : --comment.down;
                });
            };

            // 评论
            $scope.postComment = function(){
                if(!this.commentForm.content.$valid) return;

                commentservice.postComment($stateParams.isbn, $scope.star*2, this.content).then((response) => {
                    $scope.commentBox = false;
                    response.user = {
                        avatar: $scope.user.avatar,
                        username: $scope.user.username
                    };
                    response.star = response.star/2;
                    $scope.book.commenters ++;
                    $scope.book.comments.push(response);
                    $scope.content = '';
                });
                
            };
        });
})();
