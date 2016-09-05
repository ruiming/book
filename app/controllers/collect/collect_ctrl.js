(function(){
    'use strict';

    angular
        .module('index')
        .controller('CollectCtrl', CollectCtrl);

    CollectCtrl.$inject = ['booklists', 'bookservice', 'books'];

    function CollectCtrl(booklists, bookservice, books) {
        let vm = this;
        vm.swap = false;
        vm.booklists = booklists;
        vm.books = books;
    }
})();
