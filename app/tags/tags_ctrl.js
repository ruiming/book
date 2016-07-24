(function(){
    "use strict";

    angular
        .module('index')
        .controller('TagsCtrl', function(tagservice){

            let vm = this;

            tagservice.getAllTags().then(response => {
                vm.allTags = response;
            });

        });

})();
