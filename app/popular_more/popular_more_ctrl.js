(function(){
    "use strict";

    angular
        .module('index')
        .controller('PopularMoreCtrl', PopularMoreCtrl);

    PopularMoreCtrl.$inject = ['booklistservice'];

    function PopularMoreCtrl(booklistservice) {
        let vm = this;
        vm.booklists = new booklistservice.getBooklists('all');
        vm.booklists.nextPage();
    }
})();
