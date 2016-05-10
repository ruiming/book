routeApp.controller('AddressAddCtrl', function($http, $scope, $location, UserMessage){

    var data = UserMessage.getTemp();
    $scope.deleteBox = false;

    $scope.correct_name = false;
    $scope.correct_dorm = false;
    $scope.correct_phone = false;
    $scope.ok = false;

    if(data!=null) {
        $scope.name = data.name;
        $scope.phone = data.phone;
        $scope.dorm = data.dorm;
        $scope.id = data.id;
        $scope.deleteBox = true;
        UserMessage.setTemp({});
    }
    
    // todo 添加地址
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
            $http({
                method: 'POST',
                url: host + '/user_address',
                data: {
                    name: $scope.name,
                    phone: $scope.phone,
                    dormitory: $scope.dorm
                }
            }).success(function(){
                $scope.ok = true;
                window.setTimeout(function() {
                    $scope.$apply(function() {
                        $scope.ok = false;
                        // todo locate here...
                    });
                }, 2500);
            });
        }
    };

    // todo 删除地址
    $scope.delete = function(id) {
        $http({
            method: 'DELETE',
            url: host + '/user_address',
            data: {
                id: id
            }
        }).success(function(){
            $location.path('/setting/address').replace();
        });
    };

    $scope.return = function() {
        $location.path('/setting/address').replace();
    }
    
});
