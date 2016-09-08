(function(){
    'use strict';

    angular
        .module('index')
        .controller('BookInfoCtrl', BookInfoCtrl);

    BookInfoCtrl.$inject = ['bookDetail'];

    function BookInfoCtrl(bookDetail) {
        let vm = this;
        vm.book = bookDetail;
    }
})();
