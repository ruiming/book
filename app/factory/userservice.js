(function() {
    "use strict";

    angular
        .module('index')
        .factory('userservice', userservice);

    userservice.$inject = ['$http'];

    function userservice($http) {

        return {
            getUserInfo: getUserInfo
        };

        function getUserInfo() {
            return $http.get(host + '/user_info')
                .then(response => response.data);
        }
        
    }

})();