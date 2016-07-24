(function(){
    "use strict";

    angular
        .module('index')
        .controller('AddressAddCtrl', function($location, $state, User, userservice){

            let vm = this;
            vm.edit = false;
            vm.data = userservice.getAddress();

            vm.WAIT_ADD = false;
            vm.WAIT_UPDATE = false;
            vm.WAIT_DELETE = false;
            vm.WAIT_RETURN = false;

            vm.addAddress = addAddress;
            vm.updatAddress = updateAddress;
            vm.deleteAddress = deleteAddress;
            vm.setDefaultAddress = setDefaultAddress;
            vm.back = back;


            function updateAddress() {
                if(!checkForm())    return false;
                vm.WAIT_UPDATE = vm.edit;
                userservice.updateUserAddress(vm.name, vm.phone, vm.dorm, vm.id).then(() => {
                    vm.WAIT_UPDATE = !vm.edit;
                    vm.back();
                });
            }

            function addAddress() {
                if(!checkForm())    return false;
                vm.WAIT_ADD = !vm.edit;
                userservice.addUserAddress(vm.name, vm.phone, vm.dorm).then(() => {
                    vm.WAIT_ADD = vm.edit;
                    vm.back();
                });
            }


            function deleteAddress(id) {
                vm.WAIT_DELETE = true;
                userservice.deleteUserAddress(id).then(() => {
                    vm.WAIT_DELETE = false;
                    vm.back();
                });
            }

            function setDefaultAddress(id) {
                vm.WAIT_RETURN = true;
                userservice.setUserDefaultAddress(vm.name, vm.phone, vm.dorm, id).then(() => {
                    vm.WAIT_RETURN = false;
                    vm.back();
                });
            }

            function back() {
                history.back();
            }

            function checkForm() {
                console.log(+vm.addressForm.phone.$viewValue);
                if(!+vm.addressForm.phone.$viewValue) {
                    vm.correct_phone = true;
                    notie.alert(1, "手机信息有误", 0.3);
                    return false;
                }
                if(vm.addressForm.$invalid) {
                    if(vm.addressForm.name.$invalid)  {
                        vm.correct_name = true;
                        notie.alert(1, "收货人信息有误", 0.3);
                    }
                    else if(vm.addressForm.phone.$invalid)  {
                        vm.correct_phone = true;
                        notie.alert(1, "手机信息有误", 0.3);
                    }
                    else if(vm.addressForm.dorm.$invalid)  {
                        vm.correct_dorm = true;
                        notie.alert(1, "宿舍信息有误", 0.3);
                    }
                    return false;
                }
                else {
                    return true;
                }
            }

        });
})();