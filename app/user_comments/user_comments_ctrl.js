(function(){
    "use strict";

    angular
        .module('index')
        .controller('UserCommentsCtrl', function($http, userservice, commentservice){

            let vm = this;

            vm.deleteBox = false;
            vm.edit = false;
            vm.readonly = true;
            vm.busy = true;
            vm.WAIT_OPERATING = false;

            vm.focus = focus;
            vm.submit = submit;
            vm.delete = deleteComment;
            getUserComments();
            
            function getUserComments() {
                userservice.getUserComments().then(response => {
                    vm.comments = response;
                });
            }

            function focus(comment){
                comment.readonly = false;
                comment.edit = true;
            }

            function submit(comment){
                if(comment.content === void 0) {
                    return;
                }
                vm.WAIT_OPERATING = true;
                commentservice.editComment(comment.id, comment.star, comment.content).then(() => {
                    comment.readonly = true;
                    comment.edit = false;
                    vm.WAIT_OPERATING = false;
                });
            }

            function deleteComment(comment){
                vm.WAIT_OPERATING = true;
                commentservice.deleteComment(comment.id).then(() => {
                    vm.WAIT_OPERATING = false;
                    vm.comments.splice(vm.comments.indexOf(comment), 1);
                    vm.deleteBox = false;
                });
            }
        })

})();