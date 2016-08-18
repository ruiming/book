(function(){
    'use strict';

    angular
        .module('index')
        .controller('CartCtrl', CartCtrl);

    CartCtrl.$inject = ['cart', '$state', 'cartservice', 'bookservice', 'orderservice'];

    function CartCtrl(cart, $state, cartservice, bookservice, orderservice) {
        let vm = this;
        vm.checked = false;         // 默认全不选
        vm.editStatu = false;       // 默认非编辑状态
        vm.price = 0;               // 初始价格
        vm.count = 0;               // 书籍数量(单本数量可叠加，结算显示)
        vm.number = 0;              // 书籍种类(单本数量不叠加，移入收藏和删除显示)
        vm.checkArr = [];           // 暂存勾选状态
        vm.items = cart;

        vm.recount = recount;
        vm.selectAll = selectAll;
        vm.editOk = editOk;
        vm.plus = plus;
        vm.minus = minus;
        vm.edit = edit;
        vm.collect = collect;
        vm.removeBook = removeBook;
        vm.removeBooks = removeBooks;
        vm.cart2order = cart2order;
        vm.editBook = editBook;

        recount(vm.items);

        function recount() {
            vm.price = 0;
            vm.count = 0;
            vm.number = 0;
            for(let item of vm.items) {
                if(!item.deleted) {
                    vm.price += +item.checked * item.price * item.number;
                    vm.count += +item.checked * item.number;
                    item.checked ? ++vm.number: vm.number;
                }
            }
        }

        function selectAll() {
            for(let item of vm.items) {
                item.checked = vm.checked;
            }
            vm.recount();
        }

        function plus(item) {
            item.number < 10 ? ++item.number : item.number;
            cartservice.updateCart(item.book.isbn, item.number).then(() => {
                vm.recount();
            });
        }

        function minus(item) {
            item.number > 1 ? --item.number : item.number;
            cartservice.updateCart(item.book.isbn, item.number).then(() => {
                vm.recount();
            });
        }

        function edit() {
            for(let item of vm.items) {
                vm.checkArr[item.book.isbn] = item.checked;
                item.checked = false;
            }
            vm.recount();
            vm.editStatu = true;
        }

        function editOk() {
            for(let item of vm.items) {
                item.checked = vm.checkArr[item.book.isbn] || false;
            }
            vm.recount();
            vm.editStatu = false;
        }

        function removeBook(item) {
            item.checked = false;
            item.deleted = true;
            cartservice.deleteCart(item.book.isbn);
            vm.recount();
        }

        function removeBooks() {
            vm.isbn_list = '';
            for(let item of vm.items) {
                if(item.checked && !item.deleted) {
                    vm.isbn_list += vm.isbn_list ? ',' + item.book.isbn : item.book.isbn;
                    item.deleted = true;
                }
            }
            return cartservice.deleteCart(vm.isbn_list).then(() => {
                vm.recount();
            });
        }

        function collect() {
            vm.isbn_list = '';
            vm.isbn_list_collect = '';
            for(let item of vm.items) {
                if(item.checked && !item.deleted) {
                    vm.isbn_list += vm.isbn_list ? ',' + item.book.isbn : item.book.isbn;
                    if(item.book.is_collection) {
                        vm.isbn_list_collect += vm.isbn_list_collect ? ',' + item.book.isbn : item.book.isbn;
                    }
                    item.deleted = true;
                    item.checked = false;
                }
            }
            cartservice.deleteCart(vm.isbn_list);
            vm.recount();
            return bookservice.collectBook(vm.isbn_list);
        }

        function editBook(item){
            if(item.number > 10)    item.number = 10;
            if(item.number <= 0)    item.number = 1;
            cartservice.updateCart(item.book.isbn, item.number).then(() => {
                vm.recount();
            });
        }

        function cart2order() {
            let books = [];
            for (let item of vm.items) {
                if(item.checked && !item.deleted)    books.push(item);
            }
            orderservice.setStore(books);
            $state.go('cart2order');
        }

    }
})();
