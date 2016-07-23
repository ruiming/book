(function() {
    "use strict";

    angular
        .module('index')
        .factory('userservice', userservice);

    userservice.$inject = ['$http'];

    function userservice($http) {

        let address = null;


        return {
            getUserInfo: getUserInfo,
            getUserNotices: getUserNotices,
            getUserPoints: getUserPoints,
            getUserComments: getUserComments,
            postSuggestion: postSuggestion,
            getUserAddress: getUserAddress,
            updateUserAddress: updateUserAddress,
            deleteUserAddress: deleteUserAddress,
            addUserAddress: addUserAddress,
            setUserDefaultAddress: setUserDefaultAddress,
            setAddress: setAddress,
            getAddress: getAddress
        };

        function setUserDefaultAddress(name, phone, dorimitory, id) {
            return $http.put(host + '/user_address', {
                name: name,
                phone: phone,
                dorimitory: dorimitory,
                type: 'default',
                id: id
            }).then(response => response.data);
        }

        function deleteUserAddress(id) {
            return $http.delete(host + '/user_address', {
                id: id
            }).then(response => response.data);
        }

        function updateUserAddress(name, phone, dorimitory, id) {
            return $http.put(host + '/user_address', {
                name: name,
                phone: phone,
                dorimitory: dorimitory,
                id: id
            }).then(response => response.data);
        }

        function addUserAddress(name, phone, dorimitory) {
            return $http.post(host + '/user_address', {
                name: name,
                phone: phone,
                dorimitory: dorimitory
            }).then(response => response.data);
        }

        function setAddress(value) {
            address = value;
        }

        function getAddress() {
            return address;
        }

        function getUserAddress() {
            return $http.get(host + '/user_address')
                .then(response => response.data);
        }

        function getUserComments() {
            return $http.get(host + '/user_comments')
                .then(response => response.data);
        }

        function postSuggestion(content) {
            return $http.post(host + '/user_feedback', {
                content: content
            }).then(response => response.data);
        }

        function getUserPoints() {
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