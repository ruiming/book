(function(){
    "use strict";

    angular
        .module('index')
        .controller('BookListCtrl',function($stateParams, booklistservice) {
            let vm = this;
            vm.wait = false;
            vm.wait2 = false;
            vm.collect = collect;

            getBooklistDetail();

            function getBooklistDetail() {
                booklistservice.getBooklistDetail($stateParams.id).then(response => {
                    vm.booklist = response;
                    for(let book of vm.booklist.books) {
                        book.star = Math.ceil(book.rate / 2);
                    }
                });
            }

            function　collect(){
                vm.wait = true;
                booklistservice.collectBooklist($stateParams.id).then(() => {
                    vm.booklist.collect_already = !vm.booklist.collect_already;
                    vm.booklist.collect = vm.booklist.collect_already ?
                        ++vm.booklist.collect : --vm.booklist.collect;
                    vm.wait = false;
                });
            }
        });
})();
