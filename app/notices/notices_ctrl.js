routeApp.controller('NoticesCtrl', function($http, $scope){

    $scope.busy = true;

    // 获取全部消息
    $http({
        method: 'GET',
        url: host + '/user_notices'
    }).success(function(response){
        $scope.notices = response;
        $scope.busy = false;
    });
    
});
