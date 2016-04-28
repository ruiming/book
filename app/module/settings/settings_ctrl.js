routeApp.controller('SettingsCtrl', function($http, $scope, UserMessage){

    // todo 设置页，需要gravatar, name, sex, cart, order{wait,received}, address[{name, phone, dorm, id}], signature
    $http({
        method: 'GET',
        url: host + '/user',
        params: {
            type: "detail"
        }
    }).success(function(response){
        $scope.user = response;
    });

    // todo 改变性别
    $scope.change = function () {
        $http({
            method: 'POST',
            url: host + '/user',
            data: {
                sex: $scope.user.sex
            }
        }).success(function(){
            if($scope.user.sex == "男")  $scope.user.sex = "女";
            else $scope.user.sex = "男";
        })
    };

    // todo 编辑用户名字
    $scope.edit = function() {
      $http({
          method: 'POST',
          url: host + '/user',
          data: {
              name: $scope.user.name
          }
      }).success(function(response){

      });
    };

    // 页面传递参数用
    UserMessage.setSignature($scope.user.signature);
    UserMessage.setAddress($scope.user.address);

});
