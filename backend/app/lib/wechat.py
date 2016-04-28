
from app import wechat_client
from flask import request, abort, redirect, session
import functools


def oauth(method):
    @functools.wraps(method)
    def warpper(*args, **kwargs):
        code = request.args.get('code', None)
        url = wechat_client.oauth.authorize_url(request.url)

        if code:
            try:
                user_info = wechat_client.oauth.get_user_info(code)
            except Exception as e:
                print e.errmsg, e.errcode
                abort(403)
            else:
                session['user_info'] = user_info
        else:
            print url
            return redirect(url)

        return method(*args, **kwargs)
    return warpper