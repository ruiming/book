(function() {
    "use strict";

    angular
        .module('index')
        .factory('slideservice', slideservice);

    slideservice.$inject = ['$http'];

    function slideservice($http) {

        return {
            getSlides: getSlides
        };

        function getSlides() {
            return $http.get(host + '/slides')
                .then(response => response.data);
        }
    }
})();