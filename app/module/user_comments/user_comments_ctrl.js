routeApp.controller('UserCommentsCtrl', function($http, $scope){
    
    $scope.deleteBox = false;       // 删除确认框
    $scope.edit = false;            // 可编辑
    $scope.readonly = true;         // 只读
    $scope.busy = true;
    $scope.wait = false;
    $scope.required = true;
    $scope.wait2 = false;            // 删除等待

    // 用户所有评论
    $http({
        method: 'GET', 
        url: host + '/user_comments'
    }).success(function(response){
        $scope.comments = response;
        for (var i=0; i< $scope.comments.length; i++){
            $scope.comments[i].star = Math.ceil($scope.comments[i].star/2);
        }
        $scope.busy = false;
    });

    $scope.focus = function(obj){
        obj.readonly = false;
        obj.edit = true;
    };
    
    // 修改评论
    $scope.submit = function(obj){
        if(!obj.commentForm.content.$valid){
            return;
        }
        obj.wait = true;
        $http({
            method: 'PUT',
            url: host + '/comment',
            data:{
                id: obj.comment.id,
                type: "edit",
                content: obj.comment.content,
                star: obj.comment.star*2
            }
        }).success(function(){
            obj.wait = false;
            obj.readonly = true;
            obj.edit = false;
        });
    };
    
    // 删除评论
    $scope.delete = function(id, index){
        $scope.wait2 = true;
        $http({
            method: 'DELETE',
            url: host + '/comment',
            data: {
                id: id
            }
        }).success(function(){
            $scope.wait2 = false;
            $scope.comments.splice(index, 1);
        });
    };
});
