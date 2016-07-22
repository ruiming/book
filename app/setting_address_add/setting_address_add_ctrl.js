routeApp.controller('AddressAddCtrl', function($http, $scope, $location, $state, User){

    var data = User.getTemp();
    $scope.edit = false;

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
            if(this.addressForm.name.$invalid)  {
                $scope.correct_name = true;
                notie.alert(1, "收货人信息有误", 0.3);
            }
            else if(this.addressForm.phone.$invalid)  {
                $scope.correct_phone = true;
                notie.alert(1, "手机信息有误", 0.3);
            }
            else if(this.addressForm.dorm.$invalid)  {
                $scope.correct_dorm = true;
                notie.alert(1, "宿舍信息有误", 0.3);
            }
        }
        else{
            // 编辑状态
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
                    window.setTimeout(function() {
                        $scope.$apply(function() {
                            $scope.back();
                        });
                    }, 1000);
                });
            }
            // 添加状态
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
                    $scope.wait1 = false;
                    window.setTimeout(function() {
                        $scope.$apply(function() {
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
            $scope.wait3 = false;
            window.setTimeout(function() {
                $scope.$apply(function() {
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
                name: $scope.name,
                phone: $scope.phone,
                dormitory: $scope.dorm,
                type: "default"
            }
        }).success(function(){
            $scope.wait4 = false;
            window.setTimeout(function() {
                $scope.$apply(function() {
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
