routeApp.controller('AddressCtrl', function ($http, $scope, $location, UserMessage) {

    // 用单体UserMessage暂存用户相关信息

    $scope.address = UserMessage.getAddress();
    if($scope.address == undefined) $scope.address = [];

    $scope.return = function() {
        $location.path('/settings').replace();
    };

    $scope.edit = function(id) {
        UserMessage.setTemp(this.address[id]);
        // todo 编辑时要移除该地址
        UserMessage.setAddress(UserMessage.getAddress.splice(id, 1));
        $location.path('/setting/address/add').replace();
    };

    console.log($scope.address);
});