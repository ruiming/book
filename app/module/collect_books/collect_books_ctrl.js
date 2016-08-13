(function(){
    'use strict';

    angular
        .module('index')
        .controller('CollectBooksCtrl', CollectBooksCtrl);

    CollectBooksCtrl.$inject = ['bookservice', 'books'];
    
    function CollectBooksCtrl(bookservice, books) {
        let vm = this;
        vm.books = books;

        vm.remove = remove;

        function remove(book, index) {
            bookservice.discollectBook(book.isbn).then(() => {
                vm.books.splice(index, 1);
            });
        }
    }
})();
