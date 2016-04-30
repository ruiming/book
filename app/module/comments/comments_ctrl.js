routeApp.controller('CommentsCtrl',function($scope, $http, $stateParams, TEMP) {

    $scope.busy = true;
    $scope.title = TEMP.getDict().title;

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
        for (var i=0; i< response.comments.length; i++){
            $scope.comments[i].star = Math.ceil($scope.comments[i].star/2);
        }
    });

    // 顶
    $scope.up = function(comment){
        $http({
            method: 'PUT',
            url: host + '/comment',
            data: {
                id: comment.id,
                type: "up"
            }
        }).success(function(){
            if(comment.down_already) comment.down--;
            comment.up_already = !comment.up_already;
            comment.down_already = false;
            if(comment.up_already)  comment.up++;
            else comment.up--;
        });
    };

    // 踩
    $scope.down = function(comment){
        $http({
            method: 'PUT',
            url: host + '/comment',
            data: {
                id: comment.id,
                type: "down"
            }
        }).success(function(){
            if(comment.up_already) comment.up--;
            comment.down_already = !comment.down_already;
            comment.up_already = false;
            if(comment.down_already)  comment.down++;
            else comment.down--;
        });
    };
    
});
