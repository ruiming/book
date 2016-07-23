(function() {
    "use strict";

    angular
        .module('index')
        .factory('commentservice', commentservice);

    commentservice.$inject = ['$http'];

    function commentservice($http) {

        return {
            up: up,
            down: down,
            postComment: postComment,
            editComment: editComment,
            deleteComment: deleteComment
        };

        function deleteComment(id) {
            return $http.delete(host + '/comment', {
                id: id
            }).then(response => response.data);
        }

        function editComment(id, star, content) {
            return $http.put(host + '/comment', {
                id: id,
                star: star,
                content: content,
                type: 'edit'
            }).then(response => response.data);
        }

        function postComment(isbn, star, content) {
            return $http.post(host + '/comment', {
                content: content,
                star: star*2,
                isbn: isbn
            }).then(response => response.data);
        }

        function up(id) {
            return $http.put(host + '/comment', {
                id: id,
                type: 'up'
            }).then(response => response.data);
        }

        function down(id) {
            return $http.put(host + '/comment', {
                id: id,
                type: 'down'
            }).then(response => response.data);
        }

    }
})();