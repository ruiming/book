(function() {
    'use strict';

    angular
        .module('index')
        .constant('lang', {
            "MISSING_CAPTCHA": "验证码错误",
            "WRONG_PHONE": "手机号码有误",
            "MISSING_OR_WRONG_USERNAME": "用户名有误",
            "ERROR_OPERATION": "注册失败"
        });
})();