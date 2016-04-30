routeApp.controller('PointCtrl', function($http, $scope, BL){

    $scope.busy = true;

    // 获取积分记录
    $http({
        method: 'GET',
        url: host + '/user_points'
    }).success(function(response){
        $scope.points = response;
        $scope.busy = false;
    });
    
});
