(function() {
    "use strict";

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
                    book.star = Math.ceil(book.rate/2);
                }
                return books;
            }
            if(books.rate !== void 0) {
                books.star = Math.ceil(books.rate/2);
            }
            return books;
        }

    }
})();