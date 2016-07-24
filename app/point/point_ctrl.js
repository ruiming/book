(function(){
    "use strict";

    angular
        .module('index')
        .controller('PointCtrl', function(userservice){

            let vm = this;
            getUserPoint();

            function getUserPoint() {
                userservice.getUserPoints().then(response => {
                    vm.points = response;
                });
            }

        });

})();