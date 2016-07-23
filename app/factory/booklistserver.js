(function() {
    "use strict";

    angular
        .module('index')
        .factory('booklistservice', booklistservice);

    booklistservice.$inject = ['$http'];

    function booklistservice($http) {

        return {
            getHotBooklists: getHotBooklists
        };

        function getHotBooklists() {
            return $http.get(host + '/booklist?type=hot')
                .then(response => response.data);
        }
    }
})();