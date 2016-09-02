(function() {
    'use strict';

    angular
        .module('index')
        .factory('orderservice', orderservice);

    orderservice.$inject = ['$http'];

    function orderservice($http) {

        // 暂存进入订单生成页面时的勾选书籍
        let store = null;

        return {
            setStore: setStore,
            getStore: getStore,
            makeOrder: makeOrder,
            getOrderDetail: getOrderDetail,
            cancelOrder: cancelOrder,
            getOrder: getOrder
        };

        // 获取指定状态的全部书单
        function getOrder(status) {
            return $http.get(host + '/billings?status=' + status)
                .then(response => response.data);
        }

        // 取消订单
        function cancelOrder(id) {
            return $http.delete(host + '/billings/' + id)
                .then(response => response.data);
        }

        // 获取订单详细信息
        function getOrderDetail(id) {
            return $http.get(host + '/billings/' + id)
                .then(response => response.data);
        }

        // 生成订单
        function makeOrder(cart_list, number_list, address_id) {
            let form = new FormData();
            for(let cart of cart_list) form.append('cart', cart);
            for(let number of number_list) form.append('number', number)
            form.append('address', address_id);
            return $http.post(host + '/billings', form, {
                transformRequest: angular.identity,
                headers: {'Content-Type': undefined}
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