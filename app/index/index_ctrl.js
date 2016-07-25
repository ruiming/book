(function() {
    "use strict";

    angular
        .module('index')
        .controller('IndexCtrl', IndexCtrl);

    IndexCtrl.$inject = ['bookservice', 'booklistservice', 'slideservice'];

    function IndexCtrl(bookservice, booklistservice, slideservice) {
        var vm = this;
        vm.myInterval = 5000;

        getPopularBooks();
        getHotBooklists();
        getSlides();

        function getPopularBooks() {
            bookservice.getPopularBooks().then(response => {
                vm.books = response;
            });
        }

        function getHotBooklists() {
            booklistservice.getHotBooklists().then(response => {
                vm.booklists = response;
            });
        }

        function getSlides() {
            slideservice.getSlides().then(response => {
                vm.slides = response;
            });
        }
    }
})();
