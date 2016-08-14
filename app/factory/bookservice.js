(function() {
    'use strict';

    angular
        .module('index')
        .factory('bookservice', bookservice);

    bookservice.$inject = ['$http', 'commonservice', '$q'];

    function bookservice($http, commonservice, $q) {

        let bookDetail = [];
        let bookBelongs = [];
        let popBooks = null;
        let similarBook = [];
        let changeStars = commonservice.changeStars;

        return {
            getPopularBooks2: getPopularBooks2,
            getBook: getBook,
            getBookDetail: getBookDetail,
            collectBook: collectBook,
            discollectBook: discollectBook,
            getSimilarBook: getSimilarBook,
            getBookBelongs: getBookBelongs,
            getBooks: getBooks
        };

        function getPopularBooks2() {
            if(popBooks === null) {
                return popBooks = $http.get(host + '/pop_book')
                    .then(response => changeStars(response.data));
            }
            return popBooks;
        }

        function getBooks() {
            this.list = [];
            this.busy = false;
            this.url = host + '/pop_book';
            this.params = {
                page: 1
            };
            this.continue = true;
            this.nextPage = function() {
                if(!this.continue){
                    this.busy = false;
                    return;
                }
                if(this.busy) {
                    return;
                }
                this.busy = true;
                $http({
                    method: 'GET',
                    url: this.url,
                    params: this.params
                }).success(function(response){
                    var list = response;
                    if(list.length < 5 ) {
                        this.continue = false;
                    }
                    for (var i = 0 ;i < list.length; i++){
                        list[i].star = Math.ceil(list[i].rate/2);
                        this.list.push(list[i]);
                    }
                    this.busy = false;
                    this.params.page += 1;
                }.bind(this));
            }.bind(this);
            this.nextPage();
            return this;
        }

        function getBookDetail(isbn) {
            if(bookDetail[isbn] === void 0) {
                return bookDetail[isbn] = $http.get(host + '/book?type=detail&isbn=' + isbn)
                    .then(response => response.data);
            }
            return bookDetail[isbn];
        }

        function getBookBelongs(isbn) {
            if(bookBelongs[isbn] === void 0) {
                return bookBelongs[isbn] = $http.get(host + '/booklist?isbn=' + isbn)
                    .then(response => response.data);
            }
            return bookBelongs[isbn];
        }

        function getSimilarBook(isbn) {
            if(similarBook[isbn] === void 0) {
                return similarBook[isbn] = $http.get(host + '/similar_book?isbn=' + isbn)
                    .then(response => changeStars(response.data));
            }
            return similarBook[isbn];
        }

        function collectBook(isbn) {
            return $http.post(host + '/collect', {
                isbn: isbn,
                type: 'book'
            }).then(response => response.data);
        }

        function discollectBook(isbn) {
            return $http.post(host + '/collect', {
                type: 'book',
                isbn: isbn
            }).then(response => response.data);
        }

        function getBook(isbn) {
            return $http.get(host + '/book?isbn=' + isbn)
                .then(response => changeStars(response.data));
        }
    }
})();
