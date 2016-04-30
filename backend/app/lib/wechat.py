# -*- coding: utf-8 -*-

from app import wechat
from app.auth.model import User
from flask import request, abort, redirect
from time import time
import functools


def oauth(method):
    @functools.wraps(method)
    def warpper(*args, **kwargs):
        args_token = request.args.get('token', None)
        header_token = request.headers.get('token', None)
        args_user_id = request.args.get('user_id', None)
        header_user_id = request.headers.get('user_id', None)

        token = args_token or header_token
        user_id = args_user_id or header_user_id
        url = request.url

        if token:
            # 验证用户是否存在
            this_user = User.objects(wechat_openid=user_id, wechat__access_token=token)
            this_user = this_user.first() if this_user.count() == 1 else None
            if not this_user:
                return redirect(wechat.authorize_url)

            # 验证用户TOKEN是否在有效期内
            if not this_user.wechat.token_time + this_user.wechat.expires_in > int(time()):
                return redirect(wechat.authorize_url)

        else:
            return redirect(wechat.authorize_url)

        return method(*args, **kwargs)
    return warpper
