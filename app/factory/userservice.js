(function() {
    "use strict";

    angular
        .module('index')
        .factory('userservice', userservice);

    userservice.$inject = ['$http'];

    function userservice($http) {

        return {
            getUserInfo: getUserInfo,
            getUserNotices: getUserNotices,
            getUserPoints: getUserPoints
        };

        function getUserPoint() {
            return $http.get(host + '/user_points')
                .then(response => response.data);
        }

        function getUserInfo() {
            return $http.get(host + '/user_info')
                .then(response => response.data);
        }

        function getUserNotices() {
            return $http.get(host + '/user_notices')
                .then(response => response.data);
        }

    }

})();