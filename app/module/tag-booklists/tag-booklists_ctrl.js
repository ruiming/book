(function() {
    'use strict';

    angular
        .module('index')
        .controller('TagBooklistsCtrl', TagBooklistsCtrl);

    TagBooklistsCtrl.$inject = ['$stateParams', 'booklistservice', 'booklists'];

    function TagBooklistsCtrl($stateParams, booklistservice, booklists) {
        let vm = this;
        vm.booklists = booklists;
        vm.booklists.nextPage();

        vm.timeOrder = timeOrder;
        vm.collectOrder = collectOrder;

        function timeOrder() {
            vm.booklists = new booklistservice.getBooklists('time', $stateParams.tag);
            vm.booklists.nextPage();
        }

        function collectOrder() {
            vm.booklists = new booklistservice.getBooklists('collect', $stateParams.tag);
            vm.booklists.nextPage();
        }
    }
})();
