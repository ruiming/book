routeApp.controller('AddressCtrl', function ($http, $scope, $state, User) {

    $scope.wait = true;

    // 获取用户地址信息
    $http({
        method: 'GET',
        url: host + '/user_address'
    }).success(function(response){
        $scope.address = response;
        $scope.wait = false;
    });

    $scope.edit = function(){
        User.setTemp(this.x);
        $state.go('AddressAdd');
    };

    // 返回上层
    $scope.back = function() {
        history.back();
    };
});