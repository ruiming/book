angular
    .module('index')
    .controller('MeCtrl',function($scope, $http) {

    // 返回用户信息，gravatar,name,cart,order{wait,received}
    if(angular.isUndefined(sessionStorage.user)) {
        $http({
            method: 'GET',
            url: host + '/user_info'
        }).success(function(response){
            $scope.user = response;
            sessionStorage.user = angular.toJson(response);
        });
    }
    else {
        $scope.user = angular.fromJson(sessionStorage.user);
    }
    
});
