(function() {
    "use strict";

    angular
        .module('index')
        .controller('BooklistsCtrl', function ($http, booklistservice, tagservice) {

            let vm = this;
            let url = host + '/booklist';
            let params = { type: "all", page: 1 };
            vm.booklists = new booklistservice.getBooklists(url, params);

            tagservice.getHotTags().then(response => {
                vm.tags = response;
            });

            vm.timeOrder = function () {
                let params = { type: "time", page: 1 };
                vm.booklists = new booklistservice.getBooklists(url, params);
                vm.booklists.nextPage();
            };

            vm.collectOrder = function () {
                let params = { type: "collect", page: 1 };
                vm.booklists = new booklistservice.getBooklists(url, params);
                vm.booklists.nextPage();
            };
        });
})();