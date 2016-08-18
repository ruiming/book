(function(){
    'use strict';

    angular
        .module('index')
        .controller('TagsCtrl', TagsCtrl);

    TagsCtrl.$inject = ['tags'];

    function TagsCtrl(tags) {
        let vm = this;
        vm.allTags = tags;
    }
})();
