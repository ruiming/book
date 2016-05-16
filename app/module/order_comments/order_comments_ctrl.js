routeApp.controller('OrderCommentsCtrl', function($scope, $http, $stateParams){

    $scope.busy = true;

    // todo 获取待评价订单的详细信息
   $http({
       method: 'GET',
       url: host + '/orders',
       params: {
           id: $stateParams.id
       }
   }).success(function(response){
       $scope.order = response;
       $scope.busy = false;
   });
    
});
