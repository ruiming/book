(function(){
    "use strict";

    angular
        .module('index')
        .controller('SuggestCtrl', function($http, $scope, userservice){

            $scope.required = true;     // 必填
            $scope.wait = false;        // 提交反馈wait
            $scope.wait2 = false;       // 提交反馈动画时延

            userservice.getUserInfo().then(response => {
                $scope.user = response;
            });

            // 发布建议和看法
            $scope.post = function(){
                if(this.suggestBox.suggestion.$invalid) {
                    return;
                }
                $scope.wait = true;
                userservice.postSuggestion($scope.suggestion).then(() => {
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
})();