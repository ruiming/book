
from app import wechat
from app.auth.model import User
from flask import request, abort, redirect, session
import functools


def oauth(method):
    @functools.wraps(method)
    def warpper(*args, **kwargs):
        token = request.args.get('token', None)
        url = request.url
        if token:
            this_user = User.objects(wechat__access_token=token)
            this_user = this_user.first() if this_user.count() == 1 else None
            if not this_user:
                return redirect(wechat.authorize_url)
        else:
            return redirect(wechat.authorize_url)

        return method(*args, **kwargs)
    return warpper
