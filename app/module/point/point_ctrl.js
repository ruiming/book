(function(){
    'use strict';

    angular
        .module('index')
        .controller('PointCtrl', PointCtrl);

    PointCtrl.$inject = ['points'];

    function　PointCtrl(points) {
        let vm = this;
        vm.points = points;
    }
})();
