routeApp.controller('SettingsCtrl', function($http, $scope, User){

    // todo 设置页 User暂存签名
    $http({
        method: 'GET',
        url: host + '/user_info_detail'
    }).success(function(response){
        $scope.user = response;
        User.setSignature(response.signature);
    });

});
