(function(){
    'use strict';

    angular
        .module('index')
        .controller('RecommendMoreCtrl', RecommendMoreCtrl);

    RecommendMoreCtrl.$inject = ['books', 'bookservice'];

    function RecommendMoreCtrl(books, bookservice) {
        let vm = this;
        let page = 1;
        vm.books = books;

        vm.more = more;

        function more() {
            if(page !== null) {
                return bookservice.getPopularBooks(++page)
                    .then(response => {
                        if(response.length === 0) {
                            page = null;
                        } else {
                            Array.prototype.push.apply(vm.books, response);
                        }
                    })
            }
        }
    }
})();
