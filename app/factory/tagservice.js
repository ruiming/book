(function() {
    'use strict';

    angular
        .module('index')
        .factory('tagservice', tagservice);

    tagservice.$inject = ['$http', '$q'];

    function tagservice($http, $q) {

        let hotTags = null;
        let allTags = null;

        return {
            getHotTags: getHotTags,
            getAllTags: getAllTags
        };

        function getAllTags() {
            if(allTags == null) {
                return $http.get(host + '/tags?type=all')
                    .then(response => {
                        allTags = response.data;
                        return allTags;
                    });
            }
            else {
                let deferred = $q.defer();
                deferred.resolve(allTags);
                return deferred.promise;
            }
        }

        function getHotTags() {
            if(hotTags == null) {
                return $http.get(host + '/tags?type=hot')
                    .then(response => {
                        hotTags = response.data;
                        return hotTags;
                    });
            }
            else {
                let deferred = $q.defer();
                deferred.resolve(hotTags);
                return deferred.promise;
            }
        }

    }
})();