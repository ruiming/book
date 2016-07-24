(function(){
    "use strict";

    angular
        .module('index')
        .controller('RecommendMoreCtrl',function(bookservice) {

            let vm = this;
            vm.books = new bookservice.getBooks();
            vm.books.nextPage();

        });
})();
