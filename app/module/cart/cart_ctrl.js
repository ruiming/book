routeApp.controller('CartCtrl',function($scope, $http) {

    $scope.price = 0;
    $scope.busy = true;

    // 获取购物车
    $http({
        method: 'GET',
        url: host + '/user_carts'
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
            $scope.price += $scope.items[i].price*$scope.items[i].number;
        }
        if($scope.items.length == 0){
            $scope.message = true;
        }
    };

    // 从购物车删除书籍
    $scope.removeBook = function(item, index){
        $http({
            method: 'DELETE',
            url: host + '/cart',
            data: {
                isbn: item.book.isbn
            }
        }).success(function () {
            $scope.items.splice(index, 1);
            $scope.recount();
        });
    };

    // 编辑书籍数量
    $scope.editBook = function(item){
        if(item.number <= 0)   item.number = 1;
        if(item.number > 10)   item.number = 10;
        $http({
            method: 'PUT',
            url: host + '/cart',
            data: {
                "isbn": item.book.isbn,
                "number": item.number
            }
        }).success(function(){
            console.log($scope.items);
            $scope.recount();
        });
    };
    
});
