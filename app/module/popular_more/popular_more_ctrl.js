(function(){
    'use strict';

    angular
        .module('index')
        .controller('PopularMoreCtrl', PopularMoreCtrl);

    PopularMoreCtrl.$inject = ['booklists', 'booklistservice'];

    function PopularMoreCtrl(booklists, booklistservice) {
        let vm = this;
        let page = 1;
        vm.booklists = booklists;

        vm.more = more;

        function more() {
            if(page !== null) {
                return booklistservice.getBooklists(++page)
                    .then(response => {
                        if(response.length === 0) {
                            page = null;
                        } else {
                            Array.prototype.push.apply(vm.booklists, response);
                        }
                    })
            }
        }
    }
})();
