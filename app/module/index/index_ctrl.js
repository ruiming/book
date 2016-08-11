(function() {
    'use strict';

    angular
        .module('index')
        .controller('IndexCtrl', IndexCtrl);

    IndexCtrl.$inject = ['bookservice', 'booklistservice', 'slideservice', '$log', '$state'];

    function IndexCtrl(bookservice, booklistservice, slideservice, $log, $state) {
        console.log($state);
        var vm = this;
        vm.myInterval = 5000;

        getPopularBooks();
        getHotBooklists();
        getSlides();

        function getHotBooklists() {
            booklistservice.getHotBooklists().then(response => {
                vm.booklists = response;
            });
        }

        function getSlides() {
            slideservice.getSlides().then(response => {
                vm.slides = response;
                $log.log(response);
            });
        }

        function getPopularBooks() {
            bookservice.getPopularBooks().then(response => {
                vm.books = response;
                alert(response);
            });
        }
    }
})();
