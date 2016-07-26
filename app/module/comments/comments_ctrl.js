(function(){
    'use strict';

    angular
        .module('index')
        .controller('CommentsCtrl', CommentsCtrl);

    CommentsCtrl.$inject = ['$stateParams', 'commentservice'];

    function CommentsCtrl($stateParams, commentservice) {
        let vm = this;
        vm.title = commentservice.getTitle();

        vm.up = up;
        vm.down = down;

        getComment();

        function getComment() {
            commentservice.getComment($stateParams.isbn).then(response => {
                vm.comments = response;
            });
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
    }
})();
