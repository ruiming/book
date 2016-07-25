(function(){
    "use strict";
    angular
        .module('index')
        .controller('OrderCommentsCtrl', OrderCommentsCtrl);

    OrderCommentsCtrl.$inject = ['$stateParams', 'orderservice'];

    function OrderCommentsCtrl($stateParams, orderservice){
        let vm = this;
        vm.WAIT_COMMENT = false;
        vm.comment = comment;

        getOrderDetail();

        function getOrderDetail() {
            orderservice.getOrderDetail($stateParams).then(response => {
                vm.order = response;
                if(vm.status !== 'commenting') {
                    history.back();
                }
            });
        }

        function comment(){
            vm.WAIT_COMMENT = true;
            if(!this.commentForm.$valid) {
                vm.WAIT_COMMENT = false;
            }
            else {
                for(let book of vm.order.carts) {
                    commentservice.postComment(book.isbn, book.star*2, book.content);
                }
            }
            commentservice.platformComment(vm.stars1, vm.stars2, vm.stars3);
        }
    }
})();