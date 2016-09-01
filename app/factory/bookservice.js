(function() {
    'use strict';

    angular
        .module('index')
        .factory('bookservice', bookservice);

    bookservice.$inject = ['$http', 'commonservice', '$q'];

    function bookservice($http, commonservice, $q) {

        let bookDetail = [];
        let bookBelongs = [];
        let similarBook = [];
        let changeStars = commonservice.changeStars;

        return {
            getPopularBooks: getPopularBooks,
            getBook: getBook,
            getBookDetail: getBookDetail,
            collectBook: collectBook,
            discollectBook: discollectBook,
            getSimilarBook: getSimilarBook,
            getBookBelongs: getBookBelongs
        };

        function getPopularBooks(page) {
            return $http.get(host + '/books/pop?page=' + page + '&per_page=6')
                .then(response => changeStars(response.data));
        }

        function getBookDetail(isbn) {
            if(bookDetail[isbn] === void 0) {
                return bookDetail[isbn] = $http.get(host + '/book/' + isbn + '?type=detail')
                    .then(response => response.data);
            }
            return bookDetail[isbn];
        }

        function getBookBelongs(isbn) {
            if(bookBelongs[isbn] === void 0) {
                return bookBelongs[isbn] = $http.get(host + '/booklists?isbn=' + isbn)
                    .then(response => response.data);
            }
            return bookBelongs[isbn];
        }

        function getSimilarBook(isbn) {
            if(similarBook[isbn] === void 0) {
                return similarBook[isbn] = $http.get(host + '/book/' + isbn + '/similar')
                    .then(response => changeStars(response.data));
            }
            return similarBook[isbn];
        }

        function collectBook(isbn) {
            return $http.post(host + '/book/' + isbn + '/collect')
                .then(response => response.data);
        }

        function discollectBook(isbn) {
            return $http.delete(host + '/book/' + isbn + '/collect')
                .then(response => response.data);
        }

        function getBook(isbn) {
            return $http.get(host + '/book/' + isbn)
                .then(response => changeStars(response.data));
        }
    }
})();
