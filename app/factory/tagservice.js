(function() {
    "use strict";

    angular
        .module('index')
        .factory('tagservice', tagservice);

    tagservice.$inject = ['$http'];

    function tagservice($http) {

        return {
            getHotTags: getHotTags,
            getAllTags: getAllTags
        };

        function getAllTags() {
            return $http.get(host + '/tags?type=all')
                .then(response => response.data);
        }

        function getHotTags() {
            return $http.get(host + '/tags?type=hot')
                .then(response => response.data);
        }

    }
})();