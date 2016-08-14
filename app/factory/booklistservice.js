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
            getHotBooklists: getHotBooklists,
            getBooklistDetail: getBooklistDetail,
            getBooklists: getBooklists,
            loveBooklist: loveBooklist
        };

        function collectBooklist(id) {
            return $http.post(host + '/collect', {
                type: 'booklist',
                id: id
            }).then(response => response.data);
        }

        function loveBooklist(id) {
            return $http.post(host + '/booklist_love', {
                id: id
            }).then(response => response.data);
        }

        function getBooklistDetail(id) {
            if(booklist[id] === void 0) {
                return booklist[id] = $http.get(host + '/booklist?id=' + id)
                    .then(response => response.data);
            }
            return booklist[id];
        }

        function getHotBooklists() {
            return $http.get(host + '/booklist?type=hot')
                .then(response => response.data);
        }

        function getBooklists(page, type, tag) {
            let url = '/booklist?page=' + page;
            if(type)    url += '&type=' + type;
            if(tag)     url += '&tag='  + tag;
            return $http.get(host + url)
                .then(response => response.data);
        }
    }

})();