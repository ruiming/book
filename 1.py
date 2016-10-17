# -*- coding: utf-8 -*-
from top import api, appinfo
from random import randint


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

send_sms_captcha(15521246756)