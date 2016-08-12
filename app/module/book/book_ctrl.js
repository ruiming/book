(function(){
    'use strict';

    angular
        .module('index')
        .controller('BookCtrl', BookCtrl);

    BookCtrl.$inject = ['$stateParams', 'commentservice', 'bookservice', 'cartservice', 'userservice'];

    function BookCtrl($stateParams, commentservice, bookservice, cartservice, userservice){

        let vm = this;
        vm.more = false;            // 默认不加载更多书籍信息介绍
        vm.required = true;         // 必填
        vm.star = 5;                // 默认星星数

        vm.addCart = addCart;
        vm.collect = collect;
        vm.postComment = postComment;
        vm.up = up;
        vm.down = down;

        bookservice.getBook($stateParams.isbn).then(response => {
            vm.book = response;
            commentservice.setTitle(vm.book.title);
        });

        userservice.getUserInfo().then(response => {
            vm.user = response;
        });

        bookservice.getSimilarBook($stateParams.isbn).then(response => {
            vm.similarbooks = response;
        });

        bookservice.getBookBelongs($stateParams.isbn).then(response => {
            vm.booklists = response;
        });

        bookservice.getPopularBooks2().then(response => {
            vm.test = response;
        });

        function addCart(){
            return cartservice.addCart($stateParams.isbn);
        }

        function collect() {
            return bookservice.collectBook($stateParams.isbn).then(() => {
                vm.book.collect_already = !vm.book.collect_already;
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

        function down(comment) {
            commentservice.down(comment.id).then(() => {
                comment.up = comment.up_already ? --comment.up : comment.up;
                comment.down_already = !comment.down_already;
                comment.up_already = false;
                comment.down = comment.down_already ? ++comment.down : --comment.down;
            });
        }

        function postComment(){
            if(vm.content === void 0) return;
            return commentservice.postComment($stateParams.isbn, vm.star, vm.content).then((response) => {
                vm.commentBox = false;
                response.user = {
                    avatar: vm.user.avatar,
                    username: vm.user.username
                };
                response.star = response.star/2;
                vm.book.commenters ++;
                vm.book.comments.push(response);
                vm.content = '';
            });
        }
    }
})();
