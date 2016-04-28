routeApp.controller('PointCtrl', function($http, $scope, BL){

    $scope.busy = true;

    // todo 获取积分记录
    $http({
        method: 'GET',
        url: host + '/points'
    }).success(function(response){
        $scope.points = response;
        $scope.busy = false;
    });

    // todo 获取用户信息
    $http({
        method: 'GET',
        url: host + '/user'
    }).success(function(response){
        $scope.user = response;
    });
    
});
