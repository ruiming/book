(function() {
    "use strict";

    angular
        .module('index')
        .factory('cartservice', cartservice);

    cartservice.$inject = ['$http'];

    function cartservice($http) {

        return {
            getCart: getCart,
            addCart: addCart,
            updateCart: updateCart,
            deleteCart: deleteCart
        };

        function getCart() {
            return $http.get(host + '/user_carts')
                .then(response => response.data);
        }

        function updateCart(isbn ,number) {
            return $http.put(host + '/cart', {
                isbn: isbn,
                number: number
            }).then(response => response.data)
        }

        function deleteCart(isbn) {
            return $http.delete(host + '/cart',{
                isbn: isbn
            }).then(response => response.data)
        }

    }

})();