(function(){
    'use strict';

    angular
        .module('index')
        .controller('UserCommentsCtrl', UserCommentsCtrl);

    UserCommentsCtrl.$inject = ['userservice', 'commentservice'];

    function UserCommentsCtrl(userservice, commentservice) {
        let vm = this;
        vm.deleteBox = false;
        vm.edit = false;
        vm.readonly = true;

        vm.focus = focus;
        vm.submit = submit;
        vm.delete = deleteComment;

        getUserComments();

        function getUserComments() {
            userservice.getUserComments().then(response => {
                vm.comments = response;
                for(let comment of vm.comments) {
                    comment.readonly = true;
                    comment.deleteBox = false;
                }
            });
        }

        function focus(comment){
            comment.readonly = false;
            comment.edit = true;
        }

        function submit(comment){
            if(comment.content === void 0 || comment.content == '') {
                return;
            }
            return commentservice.editComment(comment.id, comment.star, comment.content).then(() => {
                comment.readonly = true;
                comment.edit = false;
            });
        }

        function deleteComment(comment){
            return commentservice.deleteComment(comment.id).then(() => {
                vm.comments.splice(vm.comments.indexOf(comment), 1);
                vm.deleteBox = false;
            });
        }
    }
})();
