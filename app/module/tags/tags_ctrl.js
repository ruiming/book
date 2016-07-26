(function(){
    'use strict';

    angular
        .module('index')
        .controller('TagsCtrl', TagsCtrl);

    TagsCtrl.$inject = ['tagservice'];

    function TagsCtrl(tagservice) {
        let vm = this;

        tagservice.getAllTags().then(response => {
            vm.allTags = response;
        });
    }
})();
