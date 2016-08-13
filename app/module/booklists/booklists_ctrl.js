(function() {
    'use strict';

    angular
        .module('index')
        .controller('BooklistsCtrl', BooklistsCtrl);

    BooklistsCtrl.$inject = ['booklistservice', 'tags', 'booklists'];

    function BooklistsCtrl(booklistservice, tags, booklists) {
        let vm = this;
        vm.tags = tags;
        vm.booklists = booklists;

        vm.timeOrder = getBooklistOrderByTime;
        vm.collectOrder = getBooklistOrderByCollect;

        function getBooklistOrderByTime() {
            vm.booklists = new booklistservice.getBooklists('time');
            vm.booklists.nextPage();
        }

        function getBooklistOrderByCollect() {
            vm.booklists = new booklistservice.getBooklists('collect');
            vm.booklists.nextPage();
        }
    }
})();
