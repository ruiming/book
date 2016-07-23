(function(){
    "use strict";

    angular
        .module('index')
        .controller('UserCommentsCtrl', function($http, $scope, userservice, commentservice){

            $scope.deleteBox = false;       // 删除确认框
            $scope.edit = false;            // 可编辑
            $scope.readonly = true;         // 只读
            $scope.busy = true;
            $scope.wait = false;
            $scope.required = true;
            $scope.wait2 = false;            // 删除等待

            userservice.getUserComments().then(response => {
                $scope.comments = response;
                for(let comment of $scope.comments) {
                    comment.star = Math.ceil(comment.star/2);
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
                commentservice.editComment(obj.comment.id, obj.comment.star, obj.comment.content).then(() => {
                    obj.wait = false;
                    obj.readonly = true;
                    obj.edit = false;
                });
            };

            // 删除评论
            $scope.delete = function(id, index){
                $scope.wait2 = true;
                commentservice.deleteComment(id).then(() => {
                    $scope.wait2 = false;
                    $scope.comments.splice(index, 1);
                });
            };
        });

})();