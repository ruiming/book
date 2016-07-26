(function(){
    "use strict";

    angular
        .module('index')
        .controller('AddressAddCtrl', AddressAddCtrl);

    AddressAddCtrl.$inject = ['userservice'];

    function AddressAddCtrl(userservice){
        let vm = this;
        vm.data = userservice.getAddress();

        if(vm.data === null) {
            vm.edit = false;
        } else {
            vm.phone = vm.data.phone;
            vm.dormitory = vm.data.dormitory;
            vm.name = vm.data.name;
            vm.id = vm.data.id;
            vm.edit = true;
            userservice.setAddress(null);
        }

        vm.addAddress = addAddress;
        vm.updateAddress = updateAddress;
        vm.deleteAddress = deleteAddress;
        vm.setDefaultAddress = setDefaultAddress;
        vm.back = back;


        function updateAddress() {
            if(!checkForm())    return false;
            return userservice.updateUserAddress(vm.name, vm.phone, vm.dormitory, vm.id).then(() => {
                vm.back();
            });
        }

        function addAddress() {
            if(!checkForm())    return false;
            return userservice.addUserAddress(vm.name, vm.phone, vm.dormitory).then(() => {
                vm.back();
            });
        }


        function deleteAddress(id) {
            return userservice.deleteUserAddress(id).then(() => {
                vm.back();
            });
        }

        function setDefaultAddress(id) {
            return userservice.setUserDefaultAddress(vm.name, vm.phone, vm.dormitory, id).then(() => {
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
    }
})();
