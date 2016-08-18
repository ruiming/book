# -*- coding: utf-8 -*-
from flask import make_response, request
from app.user.model import User
from functools import wraps
from time import time


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
        this_user = User.objects(wechat__access_token=token)
        this_user = this_user.first() if this_user.count() == 1 else None
        if not this_user:
            return False, 'FAIL_GET_USER'
        else:
            # Verify Token
            if not (this_user.wechat.token_time + this_user.wechat.expires_in > int(time())) + 10:
                return False, 'TOKEN_OUT_OF_TIME'
    else:
        return False, 'FAIL_GET_TOKEN'

    return True, 'SUCCESS'
