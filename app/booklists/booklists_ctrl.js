(function() {
    "use strict";

    angular
        .module('index')
        .controller('BooklistsCtrl', BooklistsCtrl);

    BooklistsCtrl.$inject = ['booklistservice', 'tagservice'];

    function BooklistsCtrl(booklistservice, tagservice) {
        let vm = this;
        vm.timeOrder = getBooklistOrderByTime;
        vm.collectOrder = getBooklistOrderByCollect;
        vm.booklists = new booklistservice.getBooklists('all');

        getHotTags();

        function getHotTags() {
            tagservice.getHotTags().then(response => {
                vm.tags = response;
            });
        }

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
