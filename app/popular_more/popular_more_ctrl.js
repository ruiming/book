(function(){
    "use strict";

    angular
        .module('index')
        .controller('PopularMoreCtrl',function(booklistservice) {
            let vm = this;
            vm.booklists = new booklistservice.getBooklists('all');
            vm.booklists.nextPage();

        });
})();
