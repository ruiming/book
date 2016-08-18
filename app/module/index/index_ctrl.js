(function() {
    'use strict';

    angular
        .module('index')
        .controller('IndexCtrl', IndexCtrl);

    IndexCtrl.$inject = ['hotBooklists', 'slides', 'popularBooks'];

    function IndexCtrl(hotBooklists, slides, popularBooks) {
        var vm = this;
        vm.myInterval = 5000;
        vm.booklists = hotBooklists;
        vm.slides = slides;
        vm.books = popularBooks;
    }
})();
