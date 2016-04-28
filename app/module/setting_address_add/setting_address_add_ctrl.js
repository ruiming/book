routeApp.controller('AddressAddCtrl', function($http, $scope, $location, UserMessage){

    var data = UserMessage.getTemp();
    $scope.deleteBox = false;

    if(data!=null) {
        $scope.name = data.name;
        $scope.phone = data.phone;
        $scope.dorm = data.dorm;
        $scope.id = data.id;
        $scope.deleteBox = true;
        UserMessage.setTemp({});
    }
    
    // todo 添加地址
    $scope.add = function(){
        $http({
            method: 'POST',
            url: host + '/address',
            data: {
                name: $scope.name,
                phone: $scope.phone,
                dorm: $scope.dorm
            }
        }).success(function(){
            $location.path('/setting/address').replace();
        });
    };

    // todo 删除地址
    $scope.delete = function(id) {
        $http({
            method: 'DELETE',
            url: host + '/address',
            data: {
                id: id
            }
        }).success(function(){
            $location.path('/setting/address').replace();
        });
    };

    $scope.return = function() {
        $location.path('/setting/address').replace();
    }
    
});
