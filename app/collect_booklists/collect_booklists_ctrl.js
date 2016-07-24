(function(){
    "use strict";

    angular
        .module('index')
        .controller('CollectBookListsCtrl', function(userservice){

            getUserCollect();

            function getUserCollect() {
                userservice.getUserCollect('booklist').then((response) => {
                    vm.booklists = response;
                });
            }
        });

})();
