# -*- coding: utf-8 -*-

from app import wechat
from app.auth.model import User
from flask import request, abort, redirect
from app.lib.common_function import return_message
from time import time
import functools



def oauth4link(method):
    @functools.wraps(method)
    def warpper(*args, **kwargs):
        token = request.args.get('token', None)
        user_id = request.args.get('user_id', None)
        url = request.url

        verify = True
        if token and user_id:
            # 验证用户是否存在
            this_user = User.objects(id=user_id, wechat__access_token=token)
            this_user = this_user.first() if this_user.count() == 1 else None
            if not this_user:
                verify = False
            else:
                # 验证用户TOKEN是否在有效期内
                if not (this_user.wechat.token_time + this_user.wechat.expires_in > int(time())):
                    verify = False
        else:
            verify = False

        if not verify:
            return redirect(wechat.authorize_url)

        return method(*args, **kwargs)
    return warpper


def oauth4api(method):
    @functools.wraps(method)
    def warpper(*args, **kwargs):
        token = request.headers.get('token', None)
        user_id = request.headers.get('userid', None)
        verify = True
        verify_message = ''
        if token and user_id:
            # 验证用户是否存在
            this_user = User.objects(pk=user_id, wechat__access_token=token)
            this_user = this_user.first() if this_user.count() == 1 else None
            if not this_user:
                verify = False
                verify_message += 'get user'
            else:
                # 验证用户TOKEN是否在有效期内
                if not (this_user.wechat.token_time + this_user.wechat.expires_in > int(time())):
                    verify = False
                    verify_message += 'get token'
        else:
            verify = False
            verify_message += 'get data'

        if not verify:

                return 'failure '+verify_message, 403

        return method(*args, **kwargs)
    return warpper

