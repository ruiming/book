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

        // 获取用户默认地址
        function getUserDefaultAddress() {
            if(defaultAddress === null) {
                return defaultAddress = $http.get(host + '/user/addresses?type=default')
                    .then(response => response.data);
            }
            return defaultAddress;
        }

        // 获取用户收藏
        function getUserCollect(type) {
            return $http.get(host + '/rest/user/collects/' + type)
                .then(response => changeStars(response.data));
        }

        // 设置用户默认地址
        function setUserDefaultAddress(name, phone, dormitory, id) {
            let address = {
                name: name,
                phone: phone,
                dormitory: dormitory,
                type: 'default',
            };
            return $http.put(host + '/user/addresses/' + id, address).then(response => {
                if(response.status == 200) {
                    defaultAddress = address;
                }
            });
        }

        // 删除用户地址
        function deleteUserAddress(id) {
            return $http.delete(host + '/user/addresses/' + id)
                .then(response => {
                    if(response.status == 200) {
                        defaultAddress = null;
                    }
                });
        }

        // 更新用户地址
        function updateUserAddress(name, phone, dormitory, id) {
            return $http.put(host + '/user/addresses' + id, {
                name: name,
                phone: phone,
                dormitory: dormitory,
            }).then(response => response.data);
        }

        // 添加用户地址
        function addUserAddress(name, phone, dormitory) {
            return $http.post(host + '/user/addresses', {
                name: name,
                phone: phone,
                dormitory: dormitory,
                type: 'normal'
            }).then(response => response.data);
        }

        function setAddress(value) {
            address = value;
        }

        function getAddress() {
            return address;
        }

        // 获取用户地址
        function getUserAddress() {
            return $http.get(host + '/user/addresses')
                .then(response => response.data);
        }

        // 获取用户书籍评论
        function getUserComments() {
            return $http.get(host + '/user／comments')
                .then(response => response.data);
        }

        // 提交反馈
        function postSuggestion(content) {
            return $http.post(host + '/feedback', {
                content: content
            }).then(response => response.data);
        }

        // 读取用户积分信息
        function getUserPoints() {
            return $http.get(host + '/user/points')
                .then(response => response.data);
        }

        // 读取用户信息
        function getUserInfo() {
            if(userInfo == null) {
                return userInfo = $http.get(host + '/user')
                    .then(response => response.data);
            }
            return userInfo;
        }

        // 获取通知消息
        function getUserNotices() {
            return $http.get(host + '/user/notices')
                .then(response => response.data);
        }

    }

})();