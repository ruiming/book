(function(){
    'use strict';

    angular
        .module('index')
        .controller('CommentsCtrl', CommentsCtrl);

    CommentsCtrl.$inject = ['commentservice', 'comments'];

    function CommentsCtrl(commentservice, comments) {
        let vm = this;
        vm.comments = comments;
        vm.title = commentservice.getTitle();

        vm.up = up;
        vm.down = down;

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
