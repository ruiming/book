routeApp.controller('CartCtrl',function($scope, $http, $state, TEMP) {
    $scope.price = 0;
    $scope.busy = true;
    $scope.checked = false;         // 默认全选
    $scope.status = "";             // 默认不激活
    $scope.editStatu = false;       // 默认非编辑状态
    $scope.count = 0;               // 书籍数量(单本数量可叠加，结算显示)
    $scope.number = 0;              // 书籍种类(单本数量不叠加，移入收藏和删除显示)
    $scope.checkArr = [];           // 暂存勾选状态
    TEMP.setList([]);

    // 获取购物车
    $http({
        method: 'GET',
        url: host + '/user_carts'
    }).success(function(response){
        $scope.items = response;
        $scope.busy = false;
        for(var i in $scope.items) {
            if($scope.items.hasOwnProperty(i)){
                $scope.items[i].checked = false;
                $scope.items[i].index = i;
                $scope.items[i].deleted = false;
                $scope.items[i].status = "";
            }
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
        $scope.empty = true;
        for(var i in $scope.items){
            // 不考虑已删除的
            if($scope.items.hasOwnProperty(i) && !$scope.items[i].deleted){
                $scope.empty = false;
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
        }
        if($scope.empty){
            $scope.message = true;
        }
    };

    // 全选/全不选
    $scope.selectAll = function(){
        if($scope.status == "active") {
            $scope.status = "";
            $scope.checked = false;
            for(var i in $scope.items){
                if($scope.items.hasOwnProperty(i)){
                    $scope.items[i].checked = false;
                    $scope.items[i].status = "";
                }
            }
            $scope.recount();
        }
        else {
            $scope.status = "active";
            $scope.checked = true;
            for(var j in $scope.items){
                if($scope.items.hasOwnProperty(j)){
                    $scope.items[j].checked = true;
                    $scope.items[j].status = "active";
                }
            }
            $scope.recount();
        }
    };

    // 添加书籍数量
    $scope.plus = function(item) {
        if(item.number < 10) {
            item.number++;
            $http({
                method: 'PUT',
                url: host + '/cart',
                data: {
                    isbn: item.book.isbn,
                    number: item.number
                }
            }).success(function () {
                $scope.recount();
            }).error(function () {
                $state.reload();
            });
        }
    };

    // 减少书籍数量
    $scope.minus = function(item) {
        if(item.number > 1) {
            item.number --;
            $http({
                method: 'PUT',
                url: host + '/cart',
                data: {
                    isbn: item.book.isbn,
                    number: item.number
                }
            }).success(function () {
                $scope.recount();
            }).error(function () {
                $state.reload();
            });
        }
    };

    // 编辑
    $scope.edit = function() {
        for(var i in $scope.items){
            if($scope.items.hasOwnProperty(i)){
                $scope.checkArr[i] = $scope.items[i].checked;
                $scope.items[i].checked = false;
                $scope.items[i].status = "";
            }
        }
        $scope.recount();
        $scope.editStatu = true;
    };

    // 完成编辑
    $scope.editOk = function() {
        for(var i in $scope.items){
            if($scope.items.hasOwnProperty(i)){
                $scope.items[i].checked = $scope.checkArr[i];
                if($scope.items[i].checked)    {
                    $scope.items[i].status = "active";
                }
                else {
                    $scope.items[i].status = "";
                }
            }
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

    // 删除一本书籍
    $scope.removeBook = function(item) {
        item.checked = false;
        item.deleted = true;
        $http({
            method: 'DELETE',
            url: host + '/cart',
            data: {
                isbn: item.book.isbn
            }
        }).success(function(){
            $scope.recount();
        });
    };

    // 删除多本选中书籍
    $scope.delete = function() {
        $scope.isbn_list = "";
        for(var i in $scope.items) {
            if($scope.items.hasOwnProperty(i) && $scope.items[i].checked && !$scope.items[i].deleted){
                if($scope.isbn_list == "")  $scope.isbn_list = $scope.items[i].book.isbn;
                else $scope.isbn_list = $scope.isbn_list + "," + $scope.items[i].book.isbn;
                $scope.items[i].deleted = true;
                $scope.items[i].checked = false;
            }
        }
        $http({
            method: 'DELETE',
            url: host + '/cart',
            data: {
                isbn: $scope.isbn_list
            }
        }).success(function () {
            $scope.recount();
        });
    };


    // 移入多本图书到收藏夹
    $scope.collect = function() {
        $scope.isbn_list = "";
        $scope.isbn_list_collect = "";
        for(var i in $scope.items) {
            if($scope.items.hasOwnProperty(i) && $scope.items[i].checked && !$scope.items[i].deleted){
                // 加入删除isbn列表
                if($scope.isbn_list == "")  $scope.isbn_list = $scope.items[i].book.isbn;
                else $scope.isbn_list = $scope.isbn_list + "," + $scope.items[i].book.isbn;
                // 加入收藏isbn列表，需排除已经收藏的
                if($scope.items[i].book.is_collection && $scope.isbn_list_collect == "")    $scope.isbn_list_collect = $scope.items[i].book.isbn;
                else $scope.isbn_list_collect = $scope.isbn_list_collect + "," +$scope.items[i].book.isbn;
                // 置为已删除状态和未勾选状态
                $scope.items[i].deleted = true;
                $scope.items[i].checked = false;
            }
        }
        $http({
            method: 'DELETE',
            url: host + '/cart',
            data: {
                isbn: $scope.isbn_list
            }
        }).success(function () {
            $scope.recount();
        });
        $http({
            method: 'POST',
            url: host + '/collect',
            data: {
                isbn: $scope.isbn_list,
                type: "book"
            }
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

    // 结算
    $scope.cart2order = function() {
        for(var i in $scope.items) {
            if($scope.items.hasOwnProperty(i) && $scope.items[i].checked) {
                TEMP.pushList($scope.items[i]);
            }
        }
        $state.go('cart2order');
    };

});
