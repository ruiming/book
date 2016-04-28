routeApp.controller('UserCommentsCtrl', function($http, $scope){
    
    $scope.deleteBox = false;       // 删除确认框
    $scope.edit = false;            // 可编辑
    $scope.readonly = true;         // 只读
    $scope.busy = true;

    // todo 用户所有评论
    $http({
        method: 'GET', 
        url: host + '/comments'
    }).success(function(response){
        $scope.comments = response;
        $scope.busy = false;
    });

    $scope.focus = function(obj){
        obj.readonly = false;
        obj.edit = true;
    };
    
    // todo 修改评论
    $scope.submit = function(obj){
        $http({
            method: 'POST',
            url: host + '/comment',
            data:{
                id: obj.comment.id
            }
        }).success(function(){
            obj.readonly = true;
            obj.edit = false;
        });
    };
    
    // todo 删除评论
    $scope.delete = function(id, index){
        $http({
            method: 'DELETE',
            url: host + '/comment',
            data: {
                id: id
            }
        }).success(function(){
            $scope.comments.splice(index, 1);
        });
    }
});
