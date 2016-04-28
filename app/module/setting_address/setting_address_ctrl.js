routeApp.controller('AddressCtrl', function ($http, $scope, $location, UserMessage) {

    // todo 刷新会导致UserMessage Service数据重置

    $scope.address = UserMessage.getAddress();

    $scope.return = function() {
        $location.path('/settings').replace();
    };

    $scope.edit = function(id) {
        UserMessage.setTemp(this.address[id]);
        $location.path('/setting/address/add').replace();
    };

});