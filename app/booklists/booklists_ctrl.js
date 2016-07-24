(function() {
    "use strict";

    angular
        .module('index')
        .controller('BooklistsCtrl', function ($http, booklistservice, tagservice) {
            let vm = this;
            vm.booklists = new booklistservice.getBooklists('all');

            getHotTags();

            vm.timeOrder = getBooklistOrderByTime;
            vm.collectOrder = getBooklistOrderByCollect;

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


        });
})();