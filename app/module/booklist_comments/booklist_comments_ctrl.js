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

        getCommentBL();
        getUserInfo();

        function getCommentBL() {
            commentservice.getCommentBL($stateParams.id).then(response => {
                vm.comments = response;
            });
        }

        function getUserInfo() {
            userservice.getUserInfo().then(response => {
                vm.user = response;
            })
        }

        function up(comment) {
            commentservice.upBL(comment.id).then(() => {
                comment.down = comment.down_already ? --comment.down : comment.down;
                comment.up_already = !comment.up_already;
                comment.down_already = false;
                comment.up = comment.up_already ? ++comment.up : --comment.up;
            });
        }

        function down(comment){
            commentservice.downBL(comment.id).then(() => {
                comment.up = comment.up_already ? --comment.up : comment.up;
                comment.down_already = !comment.down_already;
                comment.up_already = false;
                comment.down = comment.down_already ? ++comment.down : --comment.down;
            });
        }

        function postComment() {
            if(vm.content === void 0) return;
            return commentservice.postComment($stateParams.isbn, vm.star, vm.content).then(response => {
                vm.commentBox = false;
                response.user = {
                    avatar: vm.user.avatar,
                    username: vm.user.username
                };
                response.star = response.star/2;
                vm.comments.commenters ++;
                vm.comments.push(response);
                vm.content = '';
            });
        }
    }
})();
