routeApp.controller('Cart2OrderCtrl', function($http, $scope, TEMP, $state){

    $scope.wait = false;            // 确认订单等待

    // 从单体获取
    $scope.books = TEMP.getList();
    TEMP.setList([]);
    
    
    $scope.cart_list = "";
    $scope.order = {
        number: 0,
        price: 0
    };

    // 订单处理
    for(var i=0; i<$scope.books.length; i++){
        $scope.order.number += $scope.books[i].number;
        $scope.order.price += $scope.books[i].price * $scope.books[i].number;
        if(i !== $scope.books.length-1){
            $scope.cart_list += $scope.books[i].id + ",";
        }
        else {
            $scope.cart_list += $scope.books[i].id;
        }
    }

    // todo 获取默认地址
    $http({
        method: 'GET',
        url: host + '/user_address',
        params: {
            type: "default"
        }
    }).success(function(response){
       $scope.x = response[0];
    });

    // todo提交订单
    $scope.make = function(){
        $scope.wait = true;
        $http({
            method: 'POST',
            url: host + '/billing',
            data: {
                cart_list: $scope.cart_list,
                address_id: $scope.x.id
            }
        }).success(function(response){
            $state.go('orderDetail', {'id': response}, {"location": 'orders'});
            window.setTimeout(function() {
                $scope.$apply(function() {
                    $scope.wait = false;
                });
            }, 500);
        })
    }
});