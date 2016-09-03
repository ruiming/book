(function(){
    'use strict';

    angular
        .module('index')
        .controller('AuthRegisterCtrl', AuthRegisterCtrl);

    function AuthRegisterCtrl() {
        let vm = this;
        vm.alerts = [];
        vm.register = register;

        function register(user) {
            vm.alerts = [];
            if(vm.form.name.$invalid) vm.alerts.push("用户名不能为空");
            if(vm.form.password.$error.required) vm.alerts.push("密码不能为空");
            else if(vm.form.password.$error.minlength) vm.alerts.push("密码须大于6位");
            if(vm.form.password.$modelValue !== void 0 && vm.form.password.$modelValue !== vm.form.password_repeat.$modelValue) vm.alerts.push("两次密码不匹配");
        }
    }
})();
