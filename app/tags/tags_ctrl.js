angular
    .module('index')
    .controller('TagsCtrl', function($scope, $http){

    $scope.busy = true;

    // 获取全部标签
    $http({
        method: 'GET',
        url: host + '/tags',
        params: {
            type: "all"
        }
    }).success(function(response){
        $scope.busy = false;
        $scope.allTags = response;
    });

});
