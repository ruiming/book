(function(){
    "use strict";

    angular
        .module('index')
        .controller('Cart2OrderCtrl', function($http, $scope, TEMP, $location, cartservice){

            $scope.wait = true;            // 确认订单等待
            $scope.no_address = true;      // 地址必须有

            $scope.books = cartservice.getStore();

            $scope.cart_list = '';
            $scope.order = {
                number: 0,
                price: 0
            };

            for(let book of $scope.books) {
                $scope.order.number += book.number;
                $scope.order.price += book.price * book.number;
                $scope.cart_list += $scope.cart_list ? ',' + book.id : book.id;
            }

            userservice.getUserDefaultAddress().then(response => {
                $scope.x = response[0];
                $scope.no_address = false;
                $scope.wait = false;
            }).catch(() => {
                $scope.wait = false;
                $scope.no_address = true;
            });

            // todo提交订单
            $scope.make = function(){
                $scope.wait = true;
                orderservice.makeOrder($scope.cart_list, $scope.x.id).then((response) => {
                    $location.path('/order/'+response+'/detail').replace();
                    window.setTimeout(function() {
                        $scope.$apply(function() {
                            $scope.wait = false;
                        });
                    }, 300);
                });
            };
        });
})();