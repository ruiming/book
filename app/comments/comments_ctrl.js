(function(){
    "use strict";
    angular
        .module('index')
        .controller('CommentsCtrl',function($scope, $http, $stateParams, TEMP, commentservice) {

            $scope.busy = true;
            $scope.title = TEMP.getDict().title;

            commentservice.getComment($stateParams.isbn).then(response => {
                $scope.comments = response;
                $scope.busy = false;
                for( comment of $scope.comments ) {
                    comment.star = Math.ceil(comment.star / 2);
                }
            });

            $scope.up = function(comment) {
                commentservice.up(comment.id).then(() => {
                    comment.down = comment.down_already ? --comment.down : comment.down;
                    comment.up_already = !comment.up_already;
                    comment.down_already = false;
                    comment.up = comment.up_already ? ++comment.up : --comment.up;
                });
            };

            $scope.down = function(comment) {
                commentservice.down(comment.id).then(() => {
                    comment.up = comment.up_already ? --comment.up : comment.up;
                    comment.down_already = !comment.down_already;
                    comment.up_already = false;
                    comment.down = comment.down_already ? ++comment.down : --comment.down;
                });
            };

        });

})();
