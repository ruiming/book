(function(){
    'use strict';

    angular
        .module('index')
        .controller('OrderCommentsCtrl', OrderCommentsCtrl);

    OrderCommentsCtrl.$inject = ['$q', '$stateParams', 'orderservice', 'commentservice', 'order'];

    function OrderCommentsCtrl($q, $stateParams, orderservice, commentservice, order) {
        let vm = this;
        vm.order = order;

        vm.comment = comment;

        function comment(){
            let promises = [];
            if(!vm.commentForm.$valid) {
                notie.alert(1, '请填写全部信息', 0.3);
                return;
            }
            else {
                for(let z of vm.order.carts) {
                    promises.push(commentservice.postComment(z.book.isbn, z.book.star, z.book.content));
                }
            }
            return $q.all(promises).then(() => {
                return commentservice.platformComment($stateParams.id, vm.stars1, vm.stars2, vm.stars3);
            }).then(() => {
                history.back();
            });
        }
    }
})();
