(function() {
    "use strict";

    angular
        .module('index')
        .factory('bookservice', bookservice);

    bookservice.$inject = ['$http'];

    function bookservice($http) {

        return {
            getPopularBooks: getPopularBooks,
            addToCart: addToCart,
            getBook: getBook,
            collectBook: collectBook,
            getSimilarBook: getSimilarBook,
            getBookBelongs: getBookBelongs
        };

        function getBookBelongs(isbn) {
            return $http.get(host + '/booklist?isbn=' + isbn)
                .then(response => response.data);
        }

        function getSimilarBook(isbn) {
            return $http.get(host + '/similar_book?isbn=' + isbn)
                .then(response => changeStars(response.data))
        }

        function collectBook(isbn) {
            return $http.post(host + '/collect', {
                isbn: isbn,
                type: 'book'
            }).then(response => response.data)
        }

        function getBook(isbn) {
            return $http.get(host + '/book?isbn=' + isbn)
                .then(response => changeStars(response.data))
        }

        /**
         * 书籍评星转化
         * @param books
         * @returns {*}
         */
        function changeStars(books) {
            if(books.rate !== void 0) {
                books.star = Math.ceil(books.rate/2);
                return books;
            }
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

        function addToCart(isbn) {
            return $http.post(host + '/cart', {
                isbn: isbn
            });
        }
    }
})();