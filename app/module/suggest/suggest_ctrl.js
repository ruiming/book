routeApp.controller('SuggestCtrl', function($http, $scope){

    $scope.required = true;     // 必填
    $scope.wait = false;        // 提交反馈wait
    $scope.wait2 = false;       // 提交反馈动画时延

    $scope.name = sessionStorage.name;
    $scope.avatar = sessionStorage.avatar;

    // 发布建议和看法
    $scope.post = function(){
        if(this.suggestBox.suggestion.$invalid)    return;
        $scope.wait = true;
        $http({
            method: 'POST',
            url: host + '/user_feedback',
            data: {
                content: $scope.suggestion
            }
        }).success(function(){
            $scope.wait = false;
            $scope.wait2 = true;
            window.setTimeout(function() {
                $scope.$apply(function() {
                    $scope.wait2 = false;
                    history.back();
                });
            }, 2000);
        });
    };

});