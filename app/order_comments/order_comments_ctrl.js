(function(){
    "use strict";
    angular
        .module('index')
        .controller('OrderCommentsCtrl', function($scope, $http, $stateParams, orderservice){

            $scope.busy = true;
            $scope.wait = false;        // 等待
            $scope.alert = false;       // 错误提示

            // 获取待评价订单的详细信息
            orderservice.getOrderDetail($stateParams).then(response => {
                $scope.order = response;
                $scope.busy = false;
                if($scope.status !== 'commenting') {
                    history.back();
                }
            });

            // todo 订单评价
            $scope.comment = function(){
                $scope.wait = true;
                if(!this.commentForm.$valid) {
                    $scope.wait = false;
                    $scope.alert = true;
                    window.setTimeout(function() {
                        $scope.$apply(function() {
                            $scope.alert = false;
                        });
                    }, 4000);
                }
                else {
                    for(let book of $scope.order.carts) {
                        commentservice.postComment(book.isbn, book.star*2, book.content);
                    }
                }
                commentservice.platformComment($scope.stars1, $scope.stars2, $scope.stars3);
            };

        });

})();