(function() {
    "use strict";

    angular
        .module('index')
        .factory('bookservice', bookservice);

    bookservice.$inject = ['$http'];

    function bookservice($http) {

        return {
            getPopularBooks: getPopularBooks
        };

        /**
         * 书籍评星转化
         * @param books
         * @returns {*}
         */
        function changeStars(books) {
            for(let book of books) {
                book.star = Math.ceil(book.rate/2);
            }
            return books;
        }

        /**
         * 获取热门书籍
         * @returns {*|Promise.<TResult>}
         */
        function getPopularBooks() {
            return $http.get(host + '/pop_book')
                .then(response => changeStars(response.data));
        }
    }
})();