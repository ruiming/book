# -*- coding: utf-8 -*-
from app import app
from flask import Blueprint, jsonify, request, render_template
from app.auth.model import User
from app.auth.function import random_str

from datetime import datetime, timedelta
from app.lib.api_function import allow_cross_domain
from app.lib.common_function import return_message
auth_module = Blueprint('auth_module', __name__)


@auth_module.route('/', methods=['GET'])
def index():
    return render_template('/index.html')


@auth_module.route('/auth', methods=['GET'])
@allow_cross_domain
def auth():
    """
    授权应用对用户的操作,请求token
    :return:
    """
    pass
    user_id = request.args.get('id', None)
    if user_id is None:
        return return_message('error', 'user id could not be empty')

    this_user = User.objects(wechat_openid=user_id)
    this_user = this_user.first() if this_user.count() == 1 else None

    if this_user is None:
        return return_message('error', 'user do not exist')

    this_user.token = random_str(32)
    this_user.token_create_time = datetime.now()
    this_user.token_lasted_time = 300
    this_user.save()

    return return_message('success', {'token': this_user.token})



@auth_module.route('/auth_verify', methods=['GET'])
@allow_cross_domain
def auth_verify():
    """
    验证token是否在有效期
    :return:
    """
    # TODO: 重做用户验证系统
    user_id = request.args.get('id', None)
    token = request.args.get('token', None)

    if user_id is None or token is None:
        return jsonify({
            'status': 'error',
            'message': 'user id and token could not be empty'
        })

    verify = False

    this_user = User.objects(wechat_openid=user_id)
    this_user = this_user.first() if this_user.count() == 1 else None

    if this_user is None:
        verify = False

    if this_user.token == token and (datetime.now() - this_user.token_create_time) < timedelta(seconds=this_user.token_lasted_time):
        verify = True

    if verify:
        return jsonify({
            'verify': 'success'
        })
    else:
        return jsonify({
            'verify': 'fail'
        })