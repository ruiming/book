(function() {
    'use strict';

    angular
        .module('index')
        .factory('commonservice', commonservice);

    commonservice.$inject = ['$http'];

    function commonservice($http) {

        return {
            changeStars: changeStars
        };

        function changeStars(books) {
            if(books instanceof Array) {
                for(let book of books) {
                    if(book.rate)   book.star = Math.ceil(book.rate/2);
                    else if(book.star)   book.star = Math.ceil(book.star/2);
                }
                return books;
            }
            if(books.rate !== void 0) {
                if(books.rate)   books.star = Math.ceil(books.rate/2);
                else if(books.star)   books.star = Math.ceil(books.star/2);
            }
            return books;
        }

    }
})();