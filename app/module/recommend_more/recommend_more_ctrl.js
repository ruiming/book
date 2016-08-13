(function(){
    'use strict';

    angular
        .module('index')
        .controller('RecommendMoreCtrl', RecommendMoreCtrl);

    RecommendMoreCtrl.$inject = ['books'];

    function RecommendMoreCtrl(books) {
        let vm = this;
        vm.books = books;
        vm.books.nextPage();
    }
})();
