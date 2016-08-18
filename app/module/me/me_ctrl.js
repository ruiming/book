(function(){
    'use strict';

    angular
        .module('index')
        .controller('MeCtrl', MeCtrl);

    MeCtrl.$inject = ['me'];

    function MeCtrl(me) {
        let vm = this;
        vm.user = me;
    }
})();
