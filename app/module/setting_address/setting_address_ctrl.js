routeApp.controller('AddressCtrl', function ($http, $scope, $state, User) {

    // User暂存要修改的地址信息

    // todo 获取用户地址信息
    $http({
        method: 'GET',
        url: host + '/user_info_detail'
    }).success(function(response){
        $scope.address = response.address;
    });

    $scope.edit = function(){
        User.setTemp(this.x);
        $state.go('AddressAdd');
    };

    // 返回上层
    $scope.back = function() {
        history.back();
    }
});