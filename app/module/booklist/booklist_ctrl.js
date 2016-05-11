routeApp.controller('BookListCtrl',function($scope, $http, $stateParams) {

    $scope.busy = true;
    $scope.wait = false;
    $scope.wait1 = false;       // 收藏书单延迟
    $scope.wait2 = false;       // 取消收藏书单延迟

    // 获取书单信息
    $http({
        method: 'GET',
        url: host + '/booklist',
        params: {
            id: $stateParams.id
        }
    }).success(function(response){
        $scope.booklist = response;
        for(var i=0;i<$scope.booklist.books.length;i++){
            $scope.booklist.books[i].star = Math.ceil($scope.booklist.books[i].rate/2);
        }
        $scope.busy = false;
    });

    // 收藏书单函数,同样后端判断书单是收藏还是取消收藏
    $scope.collect = function(){
        $scope.wait = true;
        $http({
            method: 'POST',
            url: host + '/collect',
            data: {
                type: "booklist",
                id: $stateParams.id
            }
        }).success(function(){
            $scope.booklist.collect_already = !$scope.booklist.collect_already;
            if($scope.booklist.collect_already)  {
                $scope.booklist.collect++;
                $scope.wait1 = true;
            }
            else  {
                $scope.booklist.collect--;
                $scope.wait2 = true;
            }
            $scope.wait = false;
            window.setTimeout(function() {
                $scope.$apply(function() {
                    $scope.wait1 = false;
                    $scope.wait2 = false;
                });
            }, delay);
        });
    }
});
