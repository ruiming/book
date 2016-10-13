# -*- coding: utf-8 -*-
from flask import make_response, request
from app.models import User
from functools import wraps
from time import time
from top import api, appinfo
from random import randint


def allow_cross_domain(fun):
    @wraps(fun)
    def wrapper_fun(*args, **kwargs):
        rst = make_response(fun(*args, **kwargs))
        rst.headers['Access-Control-Allow-Origin'] = '*'
        rst.headers['Access-Control-Allow-Methods'] = 'PUT,GET,POST,DELETE,OPTIONS'
        allow_headers = "Referer,Accept,Origin,User-Agent"
        rst.headers['Access-Control-Allow-Headers'] = allow_headers
        return rst
    return wrapper_fun


def basic_authentication():
    token = request.headers.get('token', None)
    if token:
        # Verify User exist
        this_user = User.objects(token=token)
        this_user = this_user.first() if this_user.count() == 1 else None
        if not this_user:
            return False, 'FAIL_GET_USER'
        else:
            # Verify Token
            pass
    else:
        return False, 'FAIL_GET_TOKEN'

    return True, 'SUCCESS'


def send_sms_captcha(phone):
    """
    发送SMS验证码
    :param phone: 用户手机号
    :return: 生成的验证码(6位INT)
    """
    url = 'gw.api.taobao.com'
    port = 80
    appkey = '23481414'
    secret = 'd15cc9341957b1bed938bc55247bac30'

    phone = str(phone)

    captcha = randint(100000, 999999)
    req = api.AlibabaAliqinFcSmsNumSendRequest(url, port)
    req.set_app_info(appinfo(appkey, secret))
    req.extend = ""
    req.sms_type = "normal"
    req.sms_free_sign_name = "注册验证"
    req.sms_param = "{code:'%s'}" % captcha
    req.rec_num = phone
    req.sms_template_code = "SMS_15110001"
    try:
        resp = req.getResponse()
    except Exception, e:
        raise Exception(e.message)
    else:
        return captcha
