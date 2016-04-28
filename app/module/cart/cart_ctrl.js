routeApp.controller('CartCtrl',function($scope, $http) {

    $scope.price = 0;
    $scope.busy = true;

    // todo 获取购物车
    $http({
        method: 'GET',
        url: host + '/cart'
    }).success(function(response){
        $scope.items = response;
        $scope.busy = false;
        $scope.recount($scope.items);
    });

    // 计算价格
    $scope.recount = function(){
        $scope.price = 0;
        for(var i=0; i<$scope.items.length; i++){
            $scope.items[i].removed = false;
            $scope.price += $scope.items[i].price*$scope.items[i].count;
        }
        if($scope.items.length == 0){
            $scope.message = true;
        }
    };

    // todo 从购物车删除书籍
    $scope.removeBook = function(item, index){
        $http({
            method: 'DELETE',
            url: host + '/cart_todo',
            data: {
                isbn: item.isbn
            }
        }).success(function () {
            $scope.items.splice(index, 1);
            $scope.recount();
        });
    };

    // todo 编辑书籍数量
    $scope.editBook = function(item){
        if(item.count <= 0)   item.count = 1;
        if(item.count > 10)   item.count = 10;
        $http({
            method: 'PUT',
            url: host + '/cart_todo',
            data: {
                "isbn": item.isbn,
                "count": item.count
            }
        }).success(function(){
            $scope.recount();
        });
    };

    // todo 移入收藏夹
    $scope.mark = function(item, index){
        $http({
            method: 'POST',
            url: host + '/collect',
            data: {
                "isbn": item.isbn
            }
        }).success(function(){
            $scope.removeBook(item, index);
        });
    }
});
