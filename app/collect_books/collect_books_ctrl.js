(function(){
    "use strict";

    angular
        .module('index')
        .controller('CollectBooksCtrl', CollectBooksCtrl);

    CollectBooksCtrl.$inject = ['userservice', 'bookservice'];
    
    function CollectBooksCtrl(userservice, bookservice) {
        let vm = this;
        vm.remove = remove;

        getUserCollect();

        function getUserCollect() {
            userservice.getUserCollect('book').then(response => {
                vm.books = response;
                for(book of vm.books) {
                    book.star = Math.ceil(book.rate/2);
                }
            });
        }

        function remove(book, index) {
            bookservice.discollectBook(book.isbn).then(() => {
                vm.books.splice(index, 1);
            });
        }
    }
})();
