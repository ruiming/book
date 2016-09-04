(function(){
    'use strict';

    angular
        .module('index')
        .controller('AuthLoginCtrl', AuthLoginCtrl);

    function AuthLoginCtrl() {
        let vm = this;
        vm.alerts = [];
        vm.login = login;

        function login(user) {
            vm.alerts = [];
            if(vm.form.name.$invalid) vm.alerts.push("用户名不能为空");
            if(vm.form.password.$error.required) vm.alerts.push("密码不能为空");
            else if(vm.form.password.$error.minlength) vm.alerts.push("密码须大于6位");
        }
    }
})();
