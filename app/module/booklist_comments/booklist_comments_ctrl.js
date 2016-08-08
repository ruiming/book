(function(){
    'use strict';

    angular
        .module('index')
        .controller('BooklistCommentsCtrl', BooklistCommentsCtrl);

    BooklistCommentsCtrl.$inject = ['$stateParams', 'commentservice', 'userservice'];

    function BooklistCommentsCtrl($stateParams, commentservice, userservice) {
        let vm = this;
        vm.title = commentservice.getTitle();
        vm.commentBox = false;

        vm.postComment = postComment;
        vm.up = up;
        vm.down = down;

        getComment();
        getUserInfo();

        function getComment() {
            commentservice.getComment($stateParams.isbn).then(response => {
                vm.comments = [
                    {
                        "content": "\u8fd9\u79cd\u91cd\u4e2d\u4e4b\u91cd",
                        "create_time": 1468993867,
                        "down": 0,
                        "down_already": false,
                        "id": "5794ebbf6086e5000e620909",
                        "star": 10,
                        "up": 1,
                        "up_already": true,
                        "user": {
                            "avatar": "http://wx.qlogo.cn/mmopen/Xe4iaZDHJ3NROqLicjmleiaZX1g3LlNDBXpRQic9rcSLnKAs40FspEsoNb0BcicjlqSh8yO2TqYOzp19XHCF5acVRcmyDbodQIPE7/0",
                            "username": "\u745e\u94ed"
                        }
                    },
                    {
                        "content": "wwwwwwwwwww",
                        "create_time": 1468993867,
                        "down": 0,
                        "down_already": false,
                        "id": "5796e2b06086e5000e62096d",
                        "star": 10,
                        "up": 1,
                        "up_already": true,
                        "user": {
                            "avatar": "http://wx.qlogo.cn/mmopen/Xe4iaZDHJ3NROqLicjmleiaZX1g3LlNDBXpRQic9rcSLnKAs40FspEsoNb0BcicjlqSh8yO2TqYOzp19XHCF5acVRcmyDbodQIPE7/0",
                            "username": "\u745e\u94ed"
                        }
                    },
                    {
                        "content": "1",
                        "create_time": 1468993867,
                        "down": 0,
                        "down_already": false,
                        "id": "579701c96086e5000e620987",
                        "star": 6,
                        "up": 1,
                        "up_already": true,
                        "user": {
                            "avatar": "http://wx.qlogo.cn/mmopen/Xe4iaZDHJ3NROqLicjmleiaZX1g3LlNDBXpRQic9rcSLnKAs40FspEsoNb0BcicjlqSh8yO2TqYOzp19XHCF5acVRcmyDbodQIPE7/0",
                            "username": "\u745e\u94ed"
                        }
                    }
                ];
            });
        }

        function getUserInfo() {
            userservice.getUserInfo().then(response => {
                vm.user = response;
            })
        }

        function up(comment) {
            commentservice.up(comment.id).then(() => {
                comment.down = comment.down_already ? --comment.down : comment.down;
                comment.up_already = !comment.up_already;
                comment.down_already = false;
                comment.up = comment.up_already ? ++comment.up : --comment.up;
            });
        }

        function down(comment){
            commentservice.down(comment.id).then(() => {
                comment.up = comment.up_already ? --comment.up : comment.up;
                comment.down_already = !comment.down_already;
                comment.up_already = false;
                comment.down = comment.down_already ? ++comment.down : --comment.down;
            });
        }

        function postComment() {

        }
    }
})();
