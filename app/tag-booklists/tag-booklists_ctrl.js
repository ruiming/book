(function() {
    "use strict";

    angular
        .module('index')
        .controller('TagBooklistsCtrl', TagBooklistsCtrl);

    TagBooklistsCtrl.$inject = ['$stateParams', 'booklistservice'];

    function TagBooklistsCtrl($stateParams, booklistservice) {
        let vm = this;

        getAllBook();

        vm.timeOrder = timeOrder;
        vm.collectOrder = collectOrder;

        function getAllBook() {
            vm.booklists = new booklistservice.getBooklists('all', $stateParams.tag);
            vm.booklists.nextPage();
        }

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
