(function() {
    "use strict";

    angular
        .module('index')
        .controller('IndexCtrl',function($http, bookservice, booklistservice, slideservice) {

            var vm = this;
            vm.myInterval = 5000;
            vm.noWrapSlides = false;
            vm.active = 0;

            bookservice.getPopularBooks().then(response => {
                vm.books = response;
            });

            booklistservice.getHotBooklists().then(response => {
                vm.booklists = response;
            });

            slideservice.getSlides().then(response => {
                vm.slides = response;
            });

        });
})();
