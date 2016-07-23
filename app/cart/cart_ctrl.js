(function(){
    "use strict";

    angular
        .module('index')
        .controller('CartCtrl',function($scope, $http, $state, TEMP, cartservice, bookservice, orderservice) {
            $scope.price = 0;
            $scope.busy = true;
            $scope.checked = false;         // 默认全选
            $scope.status = "";             // 默认不激活
            $scope.editStatu = false;       // 默认非编辑状态
            $scope.count = 0;               // 书籍数量(单本数量可叠加，结算显示)
            $scope.number = 0;              // 书籍种类(单本数量不叠加，移入收藏和删除显示)
            $scope.checkArr = [];           // 暂存勾选状态
            TEMP.setList([]);

            cartservice.getCart().then(response => {
                $scope.items = response;
                $scope.busy = false;
                let index = 1;
                for(let item of $scope.items) {
                    item.checked = false;
                    item.index = index++;
                    item.deleted = false;
                    item.status = '';
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
                    for(let item of $scope.items) {
                        if(!item.deleted) {
                            $scope.empty = false;
                            $scope.price += item.checked * item.price * item.number;
                            $scope.count += item.checked * item.number;
                            if(!item.checked) {
                                $scope.checked = false;
                                $scope.status = '';
                            }
                            else {
                                $scope.number ++;
                            }
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
                    for(let item of $scope.items) {
                        item.checked = false;
                        item.status = '';
                    }
                    $scope.recount();
                }
                else {
                    $scope.status = "active";
                    $scope.checked = true;
                    for(let item of $scope.items) {
                        item.checked = true;
                        item.status = 'active'
                    }
                    $scope.recount();
                }
            };

            // 添加书籍数量
            $scope.plus = function(item) {
                if(item.number < 10) {
                    item.number++;
                    cartservice.updateCart(item.book.isbn, item.number).then(() => {
                        $scope.recount();
                    });
                }
            };

            // 减少书籍数量
            $scope.minus = function(item) {
                if(item.number > 1) {
                    item.number --;
                    cartservice.updateCart(item.book.isbn, item.number).then(() => {
                        $scope.recount();
                    });
                }
            };

            // 编辑
            $scope.edit = function() {
                for(let item of $scope.items) {
                    checkArr[item.isbn] = item.checked;
                    item.checked = false;
                    item.status = '';
                }
                $scope.recount();
                $scope.editStatu = true;
            };

            // 完成编辑
            $scope.editOk = function() {
                for(let item of $scope.items) {
                    item.checked = checkArr[item.isbn];
                    item.status = item.checked ? 'active' : '';
                }
                $scope.recount();
                $scope.editStatu = false;
            };

            // 购物车选中
            $scope.select = function(status){
                if(status === 'active') {
                    this.item.status = '';
                    this.item.checked = false;
                    $scope.recount($scope.items);
                }
                else {
                    this.item.status = 'active';
                    this.item.checked = true;
                    $scope.recount($scope.items);
                }
            };

            // 删除一本书籍
            $scope.removeBook = function(item) {
                item.checked = false;
                item.deleted = true;
                cartservice.deleteCart(item.book.isbn).then(() => {
                    $scope.recount();
                });
            };

            // 删除多本选中书籍
            $scope.delete = function() {
                $scope.isbn_list = '';
                for(let item of $scope.items) {
                    if(item.checked && item.deleted) {
                        $scope.isbn_list += $scope.isbn_list ? ',' + item.book.isbn : item.book.isbn;
                    }
                }
                cartservice.deleteCart($scope.isbn_list).then(() => {
                    $scope.recount();
                });
            };


            // 移入多本图书到收藏夹
            $scope.collect = function() {
                $scope.isbn_list = '';
                $scope.isbn_list_collect = '';
                for(let item of $scope.items) {
                    if(item.checked && item.deleted) {
                        $scope.isbn_list += $scope.isbn_list ? ',' + item.book.isbn : item.book.isbn;
                        if(item.book.is_collection) {
                            $scope.isbn_list_collect += $scope.isbn_list_collect ? ',' + item.book.isbn : item.book.isbn;
                        }
                        item.deleted = true;
                        item.checked = false;
                    }
                }
                cartservice.deleteCart($scope.isbn_list).then(() => {
                    $scope.recount();
                });
                bookservice.collectBook($scope.isbn_list);
            };


            // 编辑书籍数量
            $scope.editBook = function(item){
                if(item.number <= 0)    item.number = 1;
                if(item.number > 10)    item.number = 10;
                cartservice.updateCart(item.book.isbn, item.number).then(() => {
                    $scope.recount();
                });
            };

            // 结算
            $scope.cart2order = function() {
                for (let item of $scope.items) {
                    let books = [];
                    if(item.checked)    books.push(item);
                }
                orderservice.setStore(books);
                $state.go('cart2order');
            };

        });

})();