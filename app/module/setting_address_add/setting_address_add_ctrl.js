routeApp.controller('AddressAddCtrl', function($http, $scope, $location, $state, User){

    var data = User.getTemp();
    $scope.edit = false;

    $scope.correct_name = false;
    $scope.correct_dorm = false;
    $scope.correct_phone = false;
    $scope.ok1 = false;                  // 添加成功提示
    $scope.ok2 = false;                 // 修改成功提示
    $scope.ok3 = false;                 // 删除成功提示
    $scope.ok4 = false;                 // 设置默认地址成功提示
    $scope.wait1 = false;               // 添加等待动画
    $scope.wait2 = false;               // 修改等待动画
    $scope.wait3 = false;               // 删除等待动画
    $scope.wait4 = false;               //　设置默认地址成功动画

    if(JSON.stringify(data) != '{}') {
        $scope.name = data.name;
        $scope.phone = data.phone;
        $scope.dorm = data.dormitory;
        $scope.id = data.id;
        $scope.edit = true;
        User.setTemp({});
    }
    
    // 添加和修改地址
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
            // 编辑状态
            if($scope.edit) {
                console.log("edit");
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
                    $scope.ok2 = true;
                    window.setTimeout(function() {
                        $scope.$apply(function() {
                            $scope.ok2 = false;
                            $scope.back();
                        });
                    }, 1000);
                });
            }
            // 添加状态
            else {
                console.log("add");
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
                    $scope.wait1 = false;
                    $scope.ok1 = true;
                    window.setTimeout(function() {
                        $scope.$apply(function() {
                            $scope.ok1 = false;
                            $scope.back();
                        });
                    }, 1000);
                });
            }
        }
    };

    // 删除地址
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
                    $scope.back();
                });
            }, 1000);
        });
    };

    // 设置默认地址
    $scope.setDefault = function(id) {
        $scope.wait4 = true;
        $http({
            method: 'PUT',
            url: host + '/user_address',
            data: {
                id: id,
                type: "default"
            }
        }).success(function(){
            $scope.ok4 = true;
            $scope.wait4 = false;
            console.log(1);
            window.setTimeout(function() {
                $scope.$apply(function() {
                    $scope.ok4 = false;
                    $scope.back();
                })
            }, 1000);
        })
    };

    // 返回上层
    $scope.back = function() {
        history.back();
    };
    
});
