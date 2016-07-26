(function(){
    'use strict';

    angular
        .module('index')
        .controller('CollectBookListsCtrl', CollectBookListsCtrl);

    CollectBookListsCtrl.$inject = ['userservice'];

    function CollectBookListsCtrl(userservice) {
        let vm = this;

        getUserCollect();

        function getUserCollect() {
            userservice.getUserCollect('booklist').then(response => {
                vm.booklists = response;
            });
        }
    }
})();
