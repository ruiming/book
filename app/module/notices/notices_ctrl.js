(function() {
    'use strict';

    angular
        .module('index')
        .controller('NoticesCtrl', NoticesCtrl);

    NoticesCtrl.$inject = ['notices'];

    function NoticesCtrl(notices) {
        let vm = this;
        vm.notices = notices;
    }
})();
