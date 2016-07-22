angular
    .module('index')
    .controller('OrderCommentsCtrl', function($scope, $http, $stateParams){

    $scope.busy = true;
    $scope.wait = false;        // 等待
    $scope.alert = false;       // 错误提示

    // 获取待评价订单的详细信息
   $http({
       method: 'GET',
       url: host + '/billing',
       params: {
           id: $stateParams.id
       }
   }).success(function(response){
       $scope.order = response;
       $scope.busy = false;
       // todo check here
       if($scope.status != "commenting"){
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
            for(var i in $scope.order.carts){
                if($scope.order.carts.hasOwnProperty(i)){
                    $scope.commentBook($scope.order.carts[i].book);
                }
            }
        }
        // todo 平台评分
        $http({
            method: 'POST',
            url: host + '/user_billing',
            data: {
                stars1: $scope.stars1,
                stars2: $scope.stars2,
                stars3: $scope.stars3
            }
        }).success(function(response){

        });
    };

    // 书籍评价
    $scope.commentBook = function(book){
        console.log(book);
        $http({
            method: 'POST',
            url: host + '/comment',
            data: {
                content: book.content,
                isbn: book.isbn,
                star: book.star*2
            }
        });
    };
    
});
