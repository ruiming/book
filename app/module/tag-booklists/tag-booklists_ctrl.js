(function() {
    'use strict';

    angular
        .module('index')
        .controller('TagBooklistsCtrl', TagBooklistsCtrl);

    TagBooklistsCtrl.$inject = ['$stateParams', 'booklistservice', 'booklists'];

    function TagBooklistsCtrl($stateParams, booklistservice, booklists) {
        let vm = this;
        let type = 'all';
        let page = 1;
        let tag = $stateParams.tag;
        vm.booklists = booklists;

        vm.timeOrder = getBooklistOrderByTime;
        vm.collectOrder = getBooklistOrderByCollect;
        vm.more = more;

        function more() {
            if(page !== null) {
                return booklistservice.getBooklists(++page, type, tag)
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
            return booklistservice.getBooklists(1, 'time', tag)
                .then(response => {
                    vm.booklists = response;
                    page = 1;
                    type = 'time';
                })
        }

        function getBooklistOrderByCollect() {
            return booklistservice.getBooklists(1, 'collect', tag)
                .then(response => {
                    vm.booklists = response;
                    page = 1;
                    type = 'time';
                })
        }
    }
})();
