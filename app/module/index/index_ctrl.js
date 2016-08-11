(function() {
    'use strict';

    angular
        .module('index')
        .controller('IndexCtrl', IndexCtrl);

    IndexCtrl.$inject = ['booklistservice', 'bookservice', 'slideservice'];

    function IndexCtrl(booklistservice, bookservice, slideservice) {
        var vm = this;
        vm.myInterval = 5000;

        getHotBooklists();
        getSlides();
        getPopularBooks();


        function getHotBooklists() {
            return booklistservice.getHotBooklists().then(response => {
                vm.booklists = response;
            });
        }

        function getSlides() {
            return slideservice.getSlides().then(response => {
                vm.slides = response;
            });
        }

        function getPopularBooks() {
            vm.beforeGetPopularBooks = 'hehe';
            return bookservice.getPopularBooks().then(response => {
                vm.books = response;
                vm.afterGetPopularBooks = 'haha';
                vm.response = response;
            });
        }
    }
})();
