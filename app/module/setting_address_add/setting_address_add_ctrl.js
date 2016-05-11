routeApp.controller('AddressAddCtrl', function($http, $scope, $location, UserMessage){

    var data = UserMessage.getTemp();
    $scope.edit = false;

    $scope.correct_name = false;
    $scope.correct_dorm = false;
    $scope.correct_phone = false;
    $scope.ok = false;                  // 添加成功提示
    $scope.ok2 = false;                 // 修改成功提示
    $scope.ok3 = false;                 // 删除成功提示
    $scope.wait1 = false;               // 添加等待动画
    $scope.wait2 = false;               // 修改等待动画
    $scope.wait3 = false;               // 删除等待动画

    if(data!=null) {
        $scope.name = data.name;
        $scope.phone = data.phone;
        $scope.dorm = data.dorm;
        $scope.id = data.id;
        $scope.edit = true;
        UserMessage.setTemp({});
    }
    
    // todo 添加和修改地址
    $scope.add = function(){
        if(this.addressForm.$invalid) {
            console.log(this.addressForm);
            if(this.addressForm.name.$invalid)  {
                $scope.correct_name = true;
                window.setTimeout(function() {
                    $scope.$apply(function() {
                        $scope.correct_name = false;
                    });
                }, 2500);
            }
            else if(this.addressForm.phone.$invalid)  {
                $scope.correct_phone = true;
                window.setTimeout(function() {
                    $scope.$apply(function() {
                        $scope.correct_phone = false;
                    });
                }, 2500);
            }
            else if(this.addressForm.dorm.$invalid)  {
                $scope.correct_dorm = true;
                window.setTimeout(function() {
                    $scope.$apply(function() {
                        $scope.correct_dorm = false;
                    });
                }, 2500);
            }
        }
        else{
            // todo 编辑状态
            if($scope.edit) {
                $scope.wait2 = true;
                $http({
                    method: 'PUT',
                    url: host + '/user_address',
                    data: {
                        name: $scope.name,
                        phone: $scope.phone,
                        dormitory: $scope.dorm,
                        id: $scope.id
                    }
                }).success(function(){
                    $scope.wait2 = false;
                    $scope.ok = true;
                    window.setTimeout(function() {
                        $scope.$apply(function(response) {
                            $scope.ok = false;
                            data = response;
                            $scope.return();
                        });
                    }, 2500);
                });
            }
            // todo 发布状态
            else {
                $scope.wait1 = true;
                $http({
                    method: 'POST',
                    url: host + '/user_address',
                    data: {
                        name: $scope.name,
                        phone: $scope.phone,
                        dormitory: $scope.dorm
                    }
                }).success(function(){
                    $scope.wait2 = false;
                    $scope.ok = true;
                    window.setTimeout(function() {
                        $scope.$apply(function(response) {
                            $scope.ok = false;
                            data = response;
                            $scope.return();
                        });
                    }, 2500);
                });
            }
        }
    };

    // todo 删除地址
    $scope.delete = function(id) {
        $scope.wait3 = true;
        $http({
            method: 'DELETE',
            url: host + '/user_address',
            data: {
                id: id
            }
        }).success(function(){
            $scope.ok3 = true;
            $scope.wait3 = false;
            window.setTimeout(function() {
                $scope.$apply(function() {
                    $scope.ok3 = false;
                    $location.path('/setting/address').replace();
                });
            }, 2500);
        });
    };

    // todo 返回上层
    $scope.return = function() {
        UserMessage.setAddress(UserMessage.getAddress().push(data));
        $location.path('/setting/address').replace();
    }
    
});
