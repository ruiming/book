routeApp.controller('Cart2OrderCtrl', function($http, $scope, TEMP){

    $scope.book = TEMP.getList();
    console.log($scope.book);

});