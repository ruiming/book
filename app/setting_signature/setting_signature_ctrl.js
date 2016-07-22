routeApp.controller('SignatureCtrl', function ($http, $scope, $stateParams, $location) {

    $scope.signature = $stateParams.signature;

    // 修改签名
    $scope.post = function() {
        $http({
            method: 'POST',
            url: host + '/signature',
            data: {
                signature: this.signature
            }
        }).success(function () {
            $location.path('/settings').replace();
        });
    };
    
    $scope.return = function() {
        $location.path('/settings').replace();
    };

});