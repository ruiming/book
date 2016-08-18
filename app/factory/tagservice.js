(function() {
    'use strict';

    angular
        .module('index')
        .factory('tagservice', tagservice);

    tagservice.$inject = ['$http'];

    function tagservice($http) {

        let hotTags = null;
        let allTags = null;

        return {
            getHotTags: getHotTags,
            getAllTags: getAllTags
        };

        function getAllTags() {
            if(allTags == null) {
                return allTags = $http.get(host + '/tags?type=all')
                    .then(response => response.data);
            }
            return allTags;
        }

        function getHotTags() {
            if(hotTags == null) {
                return hotTags = $http.get(host + '/tags?type=hot')
                    .then(response => response.data);
            }
            return hotTags;
        }

    }
})();