# -*- coding: utf-8 -*-
from flask import jsonify
from app.auth.model import User
from app.user.model import Points
from datetime import datetime, timedelta


def return_message(status, status_id, data=None):
    return_data = {
        'status': str(status),
        'status_id': int(status_id),
    }
    if data:
        return_data['data'] = data

    return jsonify(return_data)


def token_verify(token):
    verify = False
    this_user = User.objects(token=token)

    if this_user.count() == 1:
        this_user = this_user.first()
        if datetime.now() - this_user.token_create_time < timedelta(seconds=this_user.token_lasted_time):
            verify = True
        else:
            verify = False
    else:
        verify = False

    if verify:
        return this_user
    else:
        return None


def credits_add(user, change, type=0, content=""):
    """
    添加积分项
    :param user: User实例
    :param change: 积分修改 e.g.  +50  -1
    :param type: 类型
    :param content: 备注
    :return: Boolean 是否添加成功
    """

    if not isinstance(change, int):
        return False

    user.credits += change
    user.save()

    Points(
        type=type,
        content=content,
        change=change,
        user=user
    ).save()

    return True
