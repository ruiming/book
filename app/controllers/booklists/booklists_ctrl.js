(function() {
    'use strict';

    angular
        .module('index')
        .controller('BooklistsCtrl', BooklistsCtrl);

    BooklistsCtrl.$inject = ['booklistservice', 'tags', 'booklists'];

    function BooklistsCtrl(booklistservice, tags, booklists) {
        let vm = this;
        let page = 1;
        let type = 'all';

        vm.tags = tags;
        vm.booklists = booklists;

        vm.timeOrder = getBooklistOrderByTime;
        vm.collectOrder = getBooklistOrderByCollect;
        vm.more = more;

        function more() {
            if(page !== null) {
                return booklistservice.getBooklists(++page, type)
                    .then(response => {
                        if(response.length === 0) {
                            page = null;
                        } else {
                            Array.prototype.push.apply(vm.booklists, response);
                        }
                    })
            }
        }

        function getBooklistOrderByTime() {
            return booklistservice.getBooklists(1, 'time')
                .then(response => {
                    vm.booklists = response;
                    page = 1;
                    type = 'time';
                })
        }

        function getBooklistOrderByCollect() {
            return booklistservice.getBooklists(1, 'collect')
                .then(response => {
                    vm.booklists = response;
                    page = 1;
                    type = 'time';
                })
        }
    }
})();
