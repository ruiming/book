
from app import wechat
from app.auth.model import User
from flask import request, abort, redirect, session
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
            this_user = User.objects(wechat_openid=user_id, wechat__access_token=token)
            this_user = this_user.first() if this_user.count() == 1 else None
            if not this_user:
                return redirect(wechat.authorize_url)
        else:
            return redirect(wechat.authorize_url)

        return method(*args, **kwargs)
    return warpper
