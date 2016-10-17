(function() {
    'use strict';

    angular
        .module('index')
        .constant('lang', {
            "MISSING_CAPTCHA": "验证码错误",
            "WRONG_PHONE": "手机号码有误",
            "MISSING_OR_WRONG_USERNAME": "用户名有误",
            "ERROR_OPERATION": "注册失败",
            "MISSING_OR_WRONG_USERNAME": "用户名有误",
            "MISSING_AVATAR": "头像有误",
            "ERROR_OPERATION": "操作有误",
            "PHONE_EXISTED": "手机号已注册",
            "WRONG_CAPTCHA_OR_TIME_LIMITED": "验证码错误或失效",
            "MISSING_OR_WRONG_PHONE": "手机号码有误"
        });
})();