(function() {
    'use strict';

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

        // 加入购物车
        function addCart(isbn) {
            return $http.post(host + '/carts', {
                isbn: isbn
            }).then(response => response.data);
        }

        // 获取购物车
        function getCart() {
            return $http.get(host + '/carts')
                .then(response => response.data);
        }

        // 更新购物车
        function updateCart(isbn ,number) {
            return $http.post(host + '/carts', {
                isbn: isbn,
                number: number
            }).then(response => response.data);
        }

        // 删除购物车中的书籍
        function deleteCart(isbn) {
            return $http.delete(host + '/carts', {data:{
                isbn: isbn
            }}).then(response => response.data);
        }

    }

})();