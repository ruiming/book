(function() {
    'use strict';

    angular
        .module('index')
        .factory('commentservice', commentservice);

    commentservice.$inject = ['$http', 'commonservice'];

    function commentservice($http, commonservice) {

        // 暂存进入全部评论页面的标题
        let title = null;

        let changeStars = commonservice.changeStars;

        return {
            up: up,
            down: down,
            upBL: upBL,
            downBL: downBL,
            postComment: postComment,
            postCommentBL: postCommentBL,
            editComment: editComment,
            editCommentBL: editCommentBL,
            deleteComment: deleteComment,
            deleteCommentBL: deleteCommentBL,
            getComment: getComment,
            getCommentBL: getCommentBL,
            platformComment: platformComment,
            getTitle: getTitle,
            setTitle: setTitle
        };

        function getTitle() {
            return title;
        }

        function setTitle(value) {
            title = value;
        }

        function getCommentBL(id) {
            return $http.get(host + '/booklistcomments?id=' + id)
                .then(response => changeStars(response.data));
        }

        function platformComment(stars1, stars2, stars3) {
            return $http.post(host + '/user_billing', {
                stars1: stars1*2,
                stars2: stars2*2,
                stars3: stars3*2
            }).then(response => response.data);
        }

        function getComment(isbn) {
            return $http.get(host + '/comments?isbn=' + isbn)
                .then(response => changeStars(response.data));
        }

        function deleteComment(id) {
            return $http.delete(host + '/comment', {data:{
                id: id
            }}).then(response => response.data);
        }

        function deleteCommentBL(id) {
            return $http.delete(host + '/booklistcomment', {data:{
                id: id
            }}).then(response => response.data);
        }

        function editComment(id, star, content) {
            return $http.put(host + '/comment', {
                id: id,
                star: star,
                content: content,
                type: 'edit'
            }).then(response => response.data);
        }

        function editCommentBL(id, star, content) {
            return $http.put(host + '/booklistcomment', {
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

        function postCommentBL(id, star, content) {
            return $http.post(host + '/booklistcomment', {
                content: content,
                star: star*2,
                id: id
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

        function upBL(id) {
            return $http.put(host + '/booklistcomment', {
                id: id,
                type: 'up'
            }).then(response => response.data);
        }

        function downBL(id) {
            return $http.put(host + '/booklistcomment', {
                id: id,
                type: 'down'
            }).then(response => response.data);
        }

    }
})();