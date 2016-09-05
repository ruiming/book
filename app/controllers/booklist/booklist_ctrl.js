(function(){
    'use strict';

    angular
        .module('index')
        .controller('BookListCtrl', BookListCtrl);

    BookListCtrl.$inject = ['$stateParams', 'booklistservice', 'booklist', '$state'];

    function BookListCtrl($stateParams, booklistservice, booklist, $state) {
        let vm = this;
        vm.booklist = booklist;

        vm.collect = collect;
        vm.love = love;
        vm.home = home;

        function home() {
            $state.go('index');
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
