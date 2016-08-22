(function() {
    'use strict';

    angular
        .module('index')
        .factory('slideservice', slideservice);

    slideservice.$inject = ['$http', '$q'];

    function slideservice($http, $q) {
        let slides = null;

        return {
            getSlides: getSlides
        };

        // 获取活动
        function getSlides() {
            if(slides === null) {
                return slides = $http.get(host + '/slides')
                    .then(response => response.data);
            }
            return slides;
        }
    }
})();
