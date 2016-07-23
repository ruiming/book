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
            makeOrder: makeOrder,
            getOrderDetail: getOrderDetail,
            cancelOrder: cancelOrder,
            receiptOrder: receiptOrder,
            getReturnOrder: getReturnOrder,
            getOrder: getOrder
        };

        function getOrder(status) {
            return $http.get(host + '/user_billings?status=' + status)
                .then(response => response.data);
        }

        function getReturnOrder() {
            return $http.get(host + '/billing?status=on_return')
                .then(response => response.data);
        }

        function receiptOrder(id) {
            return $http.put(host + '/billing', {
                id: id,
                status: 'commenting'
            }).then(response => response.data);
        }

        function cancelOrder(id) {
            return $http.delete(host + '/billing', {
                id: id
            }).then(response => response.data);
        }

        function getOrderDetail(id) {
            return $http.get(host + '/billing?id=' + id)
                .then(response => response.data);
        }

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