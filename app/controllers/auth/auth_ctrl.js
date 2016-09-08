(function(){
    'use strict';

    angular
        .module('index')
        .controller('AuthCtrl', AuthCtrl);

    function AuthCtrl() {
        let vm = this;
        vm.alerts = [];
        vm.loginin = loginin;
        vm.register = register;
        vm.switchState = switchState;

        function switchState(user) {
            vm.login = !vm.login;
            vm.alerts = [];
            user.name = user.password = user.password_repeat = '';
        }


        // TODO


        function loginin(user) {
            vm.alerts = [];
            if(vm.form.name.$invalid) vm.alerts.push("用户名不能为空");
            if(vm.form.password.$error.required) vm.alerts.push("密码不能为空");
            else if(vm.form.password.$error.minlength) vm.alerts.push("密码须大于6位");
        }

        function register(user) {
            vm.alerts = [];
            if(vm.form.name.$invalid) vm.alerts.push("用户名不能为空");
            if(vm.form.password.$error.required) vm.alerts.push("密码不能为空");
            else if(vm.form.password.$error.minlength) vm.alerts.push("密码须大于6位");
            if(vm.form.password.$modelValue !== void 0 && vm.form.password.$modelValue !== vm.form.password_repeat.$modelValue) vm.alerts.push("两次密码不匹配");
        }
    }
})();
