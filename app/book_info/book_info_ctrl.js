(function(){
    "use strict";

    angular
        .module('index')
        .controller('BookInfoCtrl', function($http, bookservice, $stateParams) {
            let vm = this;
            bookservice.getBookDetail($stateParams.isbn).then(response => {
                vm.book = response;
            });
        });

})();
