(function(){
    "use strict";

    angular
        .module('index')
        .controller('BookInfoCtrl', BookInfoCtrl);

    BookInfoCtrl.$inject = ['bookservice', '$stateParams'];

    function BookInfoCtrl(bookservice, $stateParams) {
        let vm = this;

        getBookDetail();

        function getBookDetail() {
            bookservice.getBookDetail($stateParams.isbn).then(response => {
                vm.book = response;
            });
        }
    }
})();
