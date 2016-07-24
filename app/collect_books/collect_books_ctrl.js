(function(){
    "use strict";

    angular
        .module('index')
        .controller('CollectBooksCtrl', function($http, $scope, userservice, bookservice){

            $scope.busy = true;

            userservice.getUserCollect('book').then(response => {
                $scope.books = response;
                for(book of $scope.books) {
                    book.star = Math.ceil(book.rate/2);
                }
                $scope.busy = false;
            });

            // 取消收藏书籍
            $scope.remove = function(book, index){
                bookservice.discollectBook(book.isbn).then(() => {
                    $scope.books.splice(index, 1);
                });
            };
        });

})();
