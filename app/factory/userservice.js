(function() {
    'use strict';

    angular
        .module('index')
        .factory('userservice', userservice);

    userservice.$inject = ['$http', 'commonservice', '$q'];

    function userservice($http, commonservice, $q) {

        let changeStars = commonservice.changeStars;

        let defaultAddress = null;
        let address = null;
        let userInfo = null;

        return {
            getUserInfo: getUserInfo,
            getUserNotices: getUserNotices,
            getUserPoints: getUserPoints,
            getUserComments: getUserComments,
            getUserCollect: getUserCollect,
            postSuggestion: postSuggestion,

            getUserAddress: getUserAddress,
            updateUserAddress: updateUserAddress,
            deleteUserAddress: deleteUserAddress,
            addUserAddress: addUserAddress,
            setUserDefaultAddress: setUserDefaultAddress,
            getUserDefaultAddress: getUserDefaultAddress,

            setAddress: setAddress,
            getAddress: getAddress
        };

        function getUserDefaultAddress() {
            if(defaultAddress == null) {
                return $http.get(host + '/user_address?type=default')
                    .then((response) => {
                        defaultAddress = response.data;
                        return defaultAddress;
                    });
            }
            else {
                let deferred = $q.defer();
                deferred.resolve(defaultAddress);
                return deferred.promise;
            }
        }

        function getUserCollect(type) {
            return $http.get(host + '/user_collects?type=' + type)
                .then(response => changeStars(response.data));
        }

        function setUserDefaultAddress(name, phone, dormitory, id) {
            let address = {
                name: name,
                phone: phone,
                dormitory: dormitory,
                type: 'default',
                id: id
            };
            return $http.put(host + '/user_address', address).then(response => {
                if(response.status == 200) {
                    defaultAddress = address;
                }
            });
        }

        function deleteUserAddress(id) {
            return $http.delete(host + '/user_address', {data:{
                id: id
            }}).then(response => {
                if(response.status == 200) {
                    defaultAddress = null;
                }
            });
        }

        function updateUserAddress(name, phone, dormitory, id) {
            return $http.put(host + '/user_address', {
                name: name,
                phone: phone,
                dormitory: dormitory,
                id: id
            }).then(response => response.data);
        }

        function addUserAddress(name, phone, dormitory) {
            return $http.post(host + '/user_address', {
                name: name,
                phone: phone,
                dormitory: dormitory
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
            if(userInfo == null) {
                return $http.get(host + '/user_info')
                    .then(response => {
                        userInfo = response.data;
                        return userInfo;
                    });
            }
            else {
                let deferred = $q.defer();
                deferred.resolve(userInfo);
                return deferred.promise;
            }
        }

        function getUserNotices() {
            return $http.get(host + '/user_notices')
                .then(response => response.data);
        }

    }

})();