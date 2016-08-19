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

        // 获取全部标签
        function getAllTags() {
            if(allTags == null) {
                return allTags = $http.get(host + '/tags?type=all')
                    .then(response => response.data);
            }
            return allTags;
        }

        // 获取热门标签
        function getHotTags() {
            if(hotTags == null) {
                return hotTags = $http.get(host + '/tags?type=hot')
                    .then(response => response.data);
            }
            return hotTags;
        }

    }
})();