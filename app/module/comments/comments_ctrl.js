routeApp.controller('CommentsCtrl',function($scope, $http, $stateParams) {

    $scope.busy = true;

    // 获取该书的评论
    $http({
        method: 'GET',
        url: host + '/comments',
        params: {
            isbn: $stateParams.isbn
        }
    }).success(function(response){
        $scope.comments = response;
        $scope.busy = false;
    });

    // 顶评论
    $scope.up = function(comment){
        $http({
            method: 'POST',
            url: host + '/comment',
            data: {
                id: comment.id,
                action: "up"
            }
        }).success(function(response){
            comment.up_already = !comment.up_already;
            comment.down_already = false;
            comment.up = response.up;
            comment.down = response.down;
        });
    };

    // 踩评论
    $scope.down = function(comment){
        $http({
            method: 'POST',
            url: host + '/comment',
            data: {
                id: comment.id,
                action: "down"
            }
        }).success(function(){
            comment.down_already = !comment.down_already;
            comment.up_already = false;
            comment.up = response.up;
            comment.down = response.down;
        });
    };
    
});
