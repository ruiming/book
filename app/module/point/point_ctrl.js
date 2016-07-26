(function(){
    'use strict';

    angular
        .module('index')
        .controller('PointCtrl', PointCtrl);

    PointCtrl.$inject = ['userservice'];

    function　PointCtrl(userservice) {
        let vm = this;

        getUserPoint();

        function getUserPoint() {
            userservice.getUserPoints().then(response => {
                vm.points = response;
            });
        }
    }
})();
