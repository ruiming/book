(function(){
    'use strict';

    angular
        .module('index')
        .controller('BookListCtrl', BookListCtrl);

    BookListCtrl.$inject = ['$stateParams', 'booklistservice'];

    function BookListCtrl($stateParams, booklistservice) {
        let vm = this;

        vm.collect = collect;
        vm.love = love;

        getBooklistDetail();

        function getBooklistDetail() {
            booklistservice.getBooklistDetail($stateParams.id).then(response => {
                vm.booklist = response;
                for(let book of vm.booklist.books) {
                    book.star = Math.ceil(book.rate / 2);
                }
            });
        }

        function love() {
            return booklistservice.loveBooklist($stateParams.id).then(() => {
                vm.booklist.love_already = !vm.booklist.love_already;
                vm.booklist.love = vm.booklist.love_already ?
                    ++vm.booklist.love : --vm.booklist.love;
            });
        }

        function　collect(){
            return booklistservice.collectBooklist($stateParams.id).then(() => {
                vm.booklist.collect_already = !vm.booklist.collect_already;
                vm.booklist.collect = vm.booklist.collect_already ?
                    ++vm.booklist.collect : --vm.booklist.collect;
            });
        }
    }
})();
