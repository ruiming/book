routeApp.controller('CartCtrl',function($scope, $http, $state, TEMP) {

    $scope.price = 0;
    $scope.busy = true;
    $scope.wait1 = false;           // 删除购物车书籍延迟
    $scope.wait2 = false;           // 移入收藏夹延迟
    $scope.checked = false;         // 默认全选
    $scope.status = "";             // 默认不激活
    $scope.editStatu = false;       // 默认非编辑状态
    $scope.count = 0;               // 书籍数量(单本数量可叠加，结算显示)
    $scope.number = 0;              // 书籍种类(单本数量不叠加，移入收藏和删除显示)
    $scope.checkArr = [];           // 暂存勾选状态


    // 获取购物车
    $http({
        method: 'GET',
        url: host + '/user_carts'
    }).success(function(response){
        $scope.items = response;
        $scope.busy = false;
        for(var i=0; i<$scope.items.length; i++) {
            $scope.items[i].checked = false;
            $scope.items[i].index = i;
            $scope.items[i]._index = i;     // 替代$index便于删除操作
            $scope.items[i].status = "";
        }
        $scope.recount($scope.items);
    });

    // 重新计算价格和页面的各种状态
    $scope.recount = function(){
        $scope.price = 0;
        $scope.count = 0;
        $scope.status = "active";
        $scope.checked = true;
        $scope.number = 0;
        for(var i=0; i<$scope.items.length; i++){
            $scope.price += $scope.items[i].price*$scope.items[i].number*$scope.items[i].checked;
            $scope.count += $scope.items[i].number*$scope.items[i].checked;
            if(!$scope.items[i].checked) {
                $scope.checked = false;
                $scope.status = "";
            }
            else {
                $scope.number ++ ;
            }
        }
        if($scope.items.length == 0){
            $scope.message = true;
        }
    };

    // 全选/全不选
    $scope.selectAll = function(){
        if($scope.status == "active") {
            $scope.status = "";
            $scope.checked = false;
            for(var i=0; i<$scope.items.length; i++){
                $scope.items[i].checked = false;
                $scope.items[i].status = "";
            }
            $scope.recount();
        }
        else {
            $scope.status = "active";
            $scope.checked = true;
            for(var j=0; j<$scope.items.length; j++){
                $scope.items[j].checked = true;
                $scope.items[j].status = "active";
            }
            $scope.recount();
        }
    };

    // 添加书籍数量
    $scope.plus = function(item) {
        if(item.number < 10) {
            item.number ++;
            $scope.recount();
        }
    };

    // 减少书籍数量
    $scope.minus = function(item) {
        if(item.number > 1) {
            item.number --;
            $scope.recount();
        }
    };

    // 编辑
    $scope.edit = function() {
        for(var i=0; i<$scope.items.length; i++){
            $scope.checkArr[i] = $scope.items[i].checked;
            $scope.items[i].checked = false;
            $scope.items[i].status = "";
        }
        $scope.recount();
        $scope.editStatu = true;
    };

    // 完成编辑
    $scope.editOk = function() {
        for(var i=0; i<$scope.items.length; i++){
            $scope.items[i].checked = $scope.checkArr[i];
            if($scope.items[i].checked)    $scope.items[i].status = "active";
            else    $scope.items[i].status = "";
        }
        $scope.recount();
        $scope.editStatu = false;
    };

    // 购物车选中
    $scope.select = function(status){
        if(status == "active") {
            this.item.status = "";
            this.item.checked = false;
            $scope.recount($scope.items);
        }
        else {
            this.item.status = "active";
            this.item.checked = true;
            $scope.recount($scope.items);
        }
    };

    // 删除多本选中书籍
    $scope.delete = function() {
        for(var i=0; i<$scope.items.length; i++) {
            if($scope.items[i].checked){
                $scope.removeBook($scope.items[i]);
                for(var j = i+1; j<$scope.items.length; j++) {
                    $scope.items[j]._index --;
                }
            }
        }
        $scope.recount();
    };

    // 从购物车删除单个书籍
    $scope.removeBook = function(item){
        $http({
            method: 'DELETE',
            url: host + '/cart',
            data: {
                isbn: item.book.isbn
            }
        }).success(function () {
            $scope.wait1 = true;
            $scope.items.splice(item._index, 1);
            $scope.checkArr.splice(item.index, 1);
            $scope.recount();
            window.setTimeout(function() {
                $scope.$apply(function() {
                    $scope.wait1 = false;
                });
            }, delay);
        });
    };

    // todo 移入多本图书到收藏夹，收藏有问题
    $scope.collect = function() {
        for(var i=0; i<$scope.items.length; i++) {
            if($scope.items[i].checked) {
                $scope.collectBook($scope.items[i]);
                $scope.removeBook($scope.items[i]);
                for(var j = i+1; j<$scope.items.length; j++) {
                    $scope.items[j]._index --;
                }
            }
        }
    };

    // 收藏图书
    $scope.collectBook = function(item) {
        console.log(item);
        $http({
            method: 'POST',
            url: host + '/collect',
            data: {
                isbn: item.book.isbn,
                type: "book"
            }
        }).success(function () {
            $scope.wait2 = true;
            window.setTimeout(function() {
                $scope.$apply(function() {
                    $scope.wait2 = false;
                });
            }, delay);
        });
    };

    // 编辑书籍数量
    $scope.editBook = function(item){
        if(item.number <= 0)   {
            item.number = 1;
        }
        if(item.number > 10)   {
            item.number = 10;
        }
        $http({
            method: 'PUT',
            url: host + '/cart',
            data: {
                "isbn": item.book.isbn,
                "number": item.number
            }
        }).success(function(){
            $scope.recount();
        });
    };

    // 计算
    $scope.cart2order = function() {
        var orderIsbn = [];
        for(var i=0, j=0; i<$scope.items.length; i++) {
            if($scope.items[i].checked) {
                TEMP.pushList({
                    "isbn": $scope.items[i].book.isbn,
                    "number": $scope.items[i].number
                })
            }
        }
        $state.go('cart2order');
    }
    
});
