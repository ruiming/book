(function() {
    'use strict';

    angular
        .module('index')
        .controller('BooklistsCtrl', BooklistsCtrl);

    BooklistsCtrl.$inject = ['booklistservice', 'tags'];

    function BooklistsCtrl(booklistservice, tags) {
        let vm = this;
        vm.tags = tags;
        vm.booklists = new booklistservice.getBooklists('all');

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
