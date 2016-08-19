(function() {
    'use strict';

    angular
        .module('index')
        .factory('booklistservice', booklistservice);

    booklistservice.$inject = ['$http'];

    function booklistservice($http) {
        let booklist = [];

        return {
            collectBooklist: collectBooklist,
            discollectBooklist: discollectBooklist,
            getHotBooklists: getHotBooklists,
            getBooklistDetail: getBooklistDetail,
            getBooklists: getBooklists,
            loveBooklist: loveBooklist
        };

        // 收藏书单
        function collectBooklist(id) {
            return $http.post(host + '/booklist/' + id + '/collect')
                .then(response => response.data);
        }

        // 取消收藏书单
        function discollectBooklist(id) {
            return $http.delete(host + '/booklist' + id + '/collect')
                .then(response => response.data);
        }

        // 喜欢/取消喜欢 书单
        function loveBooklist(id) {
            return $http.post(host + '/booklist/' + id + '/love')
                .then(response => response.data);
        }

        // TODO
        function getBooklistDetail(id) {
            if(booklist[id] === void 0) {
                return booklist[id] = $http.get(host + '/booklist?id=' + id)
                    .then(response => response.data);
            }
            return booklist[id];
        }

        // TODO
        function getHotBooklists() {
            return $http.get(host + '/booklist?type=hot')
                .then(response => response.data);
        }

        // 获取指定书单
        function getBooklists(page, type, tag) {
            let url = '/booklists?page=' + page;
            if(type)    url += '&type=' + type;
            if(tag)     url += '&tag='  + tag;
            return $http.get(host + url)
                .then(response => response.data);
        }
    }

})();