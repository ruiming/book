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

        // 获取书单评论
        function getCommentBL(id) {
            return $http.get(host + '/booklists/' + id + '/comments')
                .then(response => changeStars(response.data));
        }

        // TODO: 提交平台评价
        function platformComment(stars1, stars2, stars3) {
            return $http.post(host + '/user_billing', {
                stars1: stars1*2,
                stars2: stars2*2,
                stars3: stars3*2
            }).then(response => response.data);
        }

        // 读取书籍评论
        function getComment(isbn) {
            return $http.get(host + '/book/' + isbn + '/comments')
                .then(response => changeStars(response.data));
        }

        // 删除书籍评论
        function deleteComment(id) {
            return $http.delete(host + '/comments/' + id)
                .then(response => response.data);
        }

        // 删除书单评论
        function deleteCommentBL(id) {
            return $http.delete(host + '/booklistcomment/' + id)
                .then(response => response.data);
        }

        // 编辑书籍评论
        function editComment(id, star, content) {
            return $http.put(host + '/comments/' + id, {
                star: star,
                content: content,
            }).then(response => response.data);
        }

        // 修改书单评价
        function editCommentBL(id, star, content) {
            return $http.put(host + '/booklistcomment/' + id, {
                star: star,
                content: content,
            }).then(response => response.data);
        }

        // 发布书籍评论
        function postComment(isbn, star, content) {
            return $http.post(host + '/book/' + isbn + '/comments', {
                content: content,
                star: star*2,
                isbn: isbn
            }).then(response => response.data);
        }

        // 发布书单评论
        function postCommentBL(id, star, content) {
            return $http.post(host + '/booklistcomment/' + id, {
                content: content,
                star: star*2,
            }).then(response => response.data);
        }

        // 赞书籍评论
        function up(id) {
            return $http.patch(host + '/comments/' + id, {
                type: 'up'
            }).then(response => response.data);
        }

        // 踩书籍评论
        function down(id) {
            return $http.patch(host + '/comments/' + id, {
                type: 'down'
            }).then(response => response.data);
        }

        // 赞书单评价
        function upBL(id) {
            return $http.patch(host + '/booklistcomment/' + id, {
                type: 'up'
            }).then(response => response.data);
        }

        // 踩书单评价
        function downBL(id) {
            return $http.patch(host + '/booklistcomment/' + id, {
                type: 'down'
            }).then(response => response.data);
        }

    }
})();