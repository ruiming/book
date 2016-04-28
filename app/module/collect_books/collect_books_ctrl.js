routeApp.controller('CollectBooksCtrl', function($http, $scope, BL){

    $scope.busy = true;

    // todo 获取全部收藏书籍
    $http({
        method: 'GET',
        url: host + '/collect',
        params: {
            type: "book"
        }
    }).success(function(response){
        $scope.books = response;
        for(var i=0;i<$scope.books.length;i++){
            $scope.books[i].star = Math.ceil($scope.books[i].rate/2);
        }
        $scope.busy = false;
    });
    
    // todo 取消收藏书籍
    $scope.remove = function(book, index){
        $http({
            method: 'POST',
            url: host + '/collect',
            data: {
                isbn: book.isbn
            }
        }).success(function(){
            $scope.books.splice(index, 1);
        })
    }
});
