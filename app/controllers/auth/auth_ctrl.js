(function(){
    'use strict';

    angular
        .module('index')
        .controller('AuthCtrl', AuthCtrl);

    function AuthCtrl(userservice, $interval, $timeout, tokenInjector, $base64, $location) {
        let vm = this;
        vm.alerts = [];
        vm.timelimit = 0;
        vm.captcha = null;
        vm.number = parseInt(Math.random()*40, 10);
        vm.loginin = loginin;
        vm.register = register;
        vm.switchState = switchState;
        vm.changeAvater = changeAvater;
        vm.getCaptcha = getCaptcha;

        var pre = $base64.decode($location.search().redirectUrl);

        vm.avatar = `https://cdn.bookist.org/avatar/${vm.number}.jpg`;

        function changeAvater(avatar) {
            vm.number = parseInt(Math.random()*40, 10);
            vm.avatar = `https://cdn.bookist.org/avatar/${vm.number}.jpg`;
        }

        function switchState(user) {
            vm.login = !vm.login;
            vm.alerts = [];
            if(user)   user.name = user.phone = user.captcha = '';
        }

        function getCaptcha(phone) {
            if(vm.form.phone.$error.required) {
                vm.alerts.push("请输入手机号")
            } else if(vm.form.phone.$error.minlength) {
                vm.alerts.push("手机号码格式不正确");
            } else {
                vm.timelimit = 60;
                var timelimit = $interval(() => {
                    vm.timelimit --;
                }, 60000);
                $timeout(() => {
                    $interval.cancel(timelimit);
                    timelimit = undefined;
                }, 10000);
                return userservice.getCaptcha(phone).then(data => {
                    vm.captcha = data.captcha;
                }, err => {
                    if(err.status === 400 && err.data.message) {
                        vm.alerts.push(err.data.message);
                    }
                });
            }
        }

        function loginin(user) {
            vm.alerts = [];
            if(vm.form.phone.$error.required) vm.alerts.push("手机号不能为空");
            else if(vm.form.phone.$error.minlength) vm.alerts.push("手机号格式不正确");
            else if(vm.form.captcha.$error.required) vm.alerts.push("请输入验证码");
            else {
                return userservice.login(user.phone, user.captcha).then(data => {
                        tokenInjector.setAuth(data.token);
                        $location.path(pre).replace();
                    }, err => {
                        if(err.status === 400 && err.data.message) {
                            vm.alerts.push(err.data.message);
                        }
                });
            }
        }

        function register(user) {
            vm.alerts = [];
            if(vm.form.name.$error.required) vm.alerts.push("用户名不能为空");
            else if(vm.form.name.$error.minlength) vm.alerts.push("用户名不能少于两位");
            else if(vm.form.phone.$error.required) vm.alerts.push("手机号不能为空");
            else if(vm.form.phone.$error.minlength) vm.alerts.push("手机号格式不正确");
            else if(vm.form.captcha.$error.required) vm.alerts.push("请输入验证码");
            else {
                return userservice.register(user.name, user.phone, user.captcha, vm.number).then(data => {
                    tokenInjector.setAuth(data.token);
                    $location.path(pre).replace();
                }, err => {
                    if(err.status === 400 && err.data.message) {
                        vm.alerts.push(err.data.message);
                    }
                });
            }
        }
    }
})();
