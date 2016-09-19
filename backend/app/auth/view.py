# -*- coding: utf-8 -*-
from app import app, wechat
from flask import Blueprint, jsonify, request, render_template, redirect, abort, url_for
from flask_security import login_user, current_user, login_required, utils, logout_user
from app.auth.model import User, WechatOAuth
from app.auth.function import random_str

from app.user.model import Points
from time import time


from datetime import datetime, timedelta
from app.lib.api_function import allow_cross_domain
from app.lib.wechat import oauth4link
from app.lib.common_function import return_message


# WECHAT
from wechatpy.utils import check_signature
from wechatpy.exceptions import InvalidSignatureException, WeChatOAuthException


auth_module = Blueprint('auth_module', __name__)


@auth_module.route('/', methods=['GET'])
@oauth4link
def index():
    return render_template('/index.html')


@auth_module.route('/wechat_auth', methods=['GET'])
def wechat_auth():
    """
    微信授权验证
    """

    token = app.config['TOKEN']
    signature = request.args.get('signature', None)
    timestamp = request.args.get('timestamp', None)
    echostr = request.args.get('echostr', None)
    nonce = request.args.get('nonce', None)
    try:
        check_signature(token, signature, timestamp, nonce)
    except InvalidSignatureException:
        return 'failure'

    return str(echostr)


@auth_module.route('/auth_verify', methods=['GET'])
@allow_cross_domain
def auth_verify():
    """
    验证token是否在有效期
    :return:
    """
    user_id = request.args.get('user_id', None)
    token = request.args.get('token', None)
    if user_id and token:
        this_user = User.objects(id=user_id)
        this_user = this_user.first() if this_user.count() == 1 else None

        if not this_user:
            return return_message('error', 2)

        if not (this_user.wechat.access_token == token and this_user.wechat.token_time + this_user.wechat.expires_in > int(time())):
            try:
                res = wechat.refresh_access_token(this_user.wechat.refresh_token)
            except Exception as e:
                return return_message('error', 3)
            else:
                this_user.wechat.access_token = res['access_token']
                this_user.wechat.expires_in = res['expires_in']
                this_user.wechat.refresh_token = res['refresh_token']
                this_user.wechat.token_time = int(time())
                this_user.save()

        return return_message('success', 4, {'token': this_user.wechat.access_token, 'time': this_user.wechat.token_time})
    return return_message('error', 1)


@auth_module.route('/code2token', methods=['GET'])
def code2token():

    code = request.args.get('code', None)
    if code:
        try:
            token = wechat.fetch_access_token(code)

        except WeChatOAuthException as e:
            # logger
            print e
            return return_message('error', 5)
        else:

            this_user = User.objects(id=token['openid'])
            this_user = this_user.first() if this_user.count() == 1 else None

            try:
                user_info = wechat.get_user_info(openid=token['openid'], access_token=token['access_token'])
            except Exception as e:
                return return_message('error', 6)
            else:
                if not this_user:
                    print user_info
                    print user_info.get('openid', None)
                    this_user = User(
                        username=user_info.get('nickname', ''),
                        country=user_info.get('country', ''),
                        city=user_info.get('city', ''),
                        province=user_info.get('province', ''),
                        id=user_info.get('openid', ''),
                        avatar=user_info.get('headimgurl', ''),
                        sex=user_info.get('sex', 0)
                    )
                    this_user.save()

               # 更新用户信息
                print user_info
                this_user.avatar = user_info.get('headimgurl', '')
                this_user.sex = user_info.get('sex', 0)
                this_user.username = user_info.get('nickname', '')

                this_user.wechat = WechatOAuth(
                    access_token=token['access_token'],
                    expires_in=token['expires_in'],
                    refresh_token=token['refresh_token'],
                    token_time=int(time())
                )
                this_user.wechat.save()
                this_user.save()

                Points.add_record(
                    user=this_user,
                    record_type=Points.PointType.FIRST_LOGIN,
                )

                return redirect("https://www.bookist.org/?token={}&user_id={}".format(token['access_token'], token['openid'])), 301

    return return_message('error', 1)


@auth_module.route('/admin-auth', methods=['GET', 'POST'])
def admin_auth():
    if request.method == 'GET':

        return render_template('admin-custom/admin-login.html')

    elif request.method == 'POST':
        username = request.form.get("username", None)
        password = request.form.get("password", None)
        if not username or not password:
            abort(403)

        user = User.objects(email=username, password=password)
        if user.count() == 1:
            login_user(user.first(), False)
            return redirect(url_for('admin.index'))

        else:
            abort(403)


@auth_module.route('/admin-auth-out', methods=['GET'])
def admin_auth_out():
    logout_user()
    return 'done'
