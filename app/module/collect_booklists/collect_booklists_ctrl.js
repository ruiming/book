(function(){
    'use strict';

    angular
        .module('index')
        .controller('CollectBookListsCtrl', CollectBookListsCtrl);

    CollectBookListsCtrl.$inject = ['booklists'];

    function CollectBookListsCtrl(booklists) {
        let vm = this;
        vm.booklists = booklists;
    }
})();
