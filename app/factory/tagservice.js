(function() {
    "use strict";

    angular
        .module('index')
        .factory('tagservice', tagservice);

    tagservice.$inject = ['$http'];

    function tagservice($http) {

        return {
            getHotTags: getHotTags
        };

        function getHotTags() {
            return $http.get(host + '/tags?type=hot')
                .then(response => response.data);
        }

    }
})();