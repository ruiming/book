(function() {
    "use strict";

    angular
        .module('index')
        .factory('orderservice', orderservice);

    orderservice.$inject = ['$http'];

    function orderservice($http) {

        let store = null;

        return {
            setStore: setStore,
            getStore: getStore,
            makeOrder: makeOrder
        };

        function makeOrder(cart_list, address_id) {
            return $http.post(host + '/billing', {
                cart_list: cart_list,
                address_id: address_id
            }).then(response => response.data);
        }

        function setStore(books) {
            store = books;
        }

        function getStore() {
            return store;
        }

    }

})();