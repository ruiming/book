(function(){
    'use strict';

    angular
        .module('index')
        .controller('PopularMoreCtrl', PopularMoreCtrl);

    PopularMoreCtrl.$inject = ['booklists'];

    function PopularMoreCtrl(booklists) {
        let vm = this;
        vm.booklists = booklists;
        vm.booklists.nextPage();
    }
})();
