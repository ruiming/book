(function() {
    "use strict";

    angular
        .module('index')
        .factory('slideservice', slideservice);

    slideservice.$inject = ['$http', '$q'];

    function slideservice($http, $q) {
        let slides = null;
        let deferred = $q.defer();

        return {
            getSlides: getSlides
        };

        /**
         * 获取活动轮播
         * @returns {*}
         */
        function getSlides() {
            if(slides === null) {
                return $http.get(host + '/slides')
                    .then(response => {
                        slides = response.data;
                        return slides;
                    });
            }
            else {
                deferred.resolve(slides);
                return deferred.promise;
            }
        }
    }
})();
