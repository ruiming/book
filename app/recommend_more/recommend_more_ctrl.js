(function(){
    "use strict";

    angular
        .module('index')
        .controller('RecommendMoreCtrl', RecommendMoreCtrl);

    RecommendMoreCtrl.$inject = ['bookservice'];

    function RecommendMoreCtrl(bookservice) {
        let vm = this;
        vm.books = new bookservice.getBooks();
        vm.books.nextPage();
    }
})();
