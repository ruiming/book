# -*- coding: utf-8 -*-
from app import db
from time import time




class WechatOAuth(db.EmbeddedDocument):
    access_token = db.StringField()
    expires_in = db.IntField()
    refresh_token = db.StringField()
    token_time = db.IntField()


class User(db.Document):

    id = db.StringField(required=True, unique=True, primary_key=True)
    email = db.StringField()
    username = db.StringField(required=True)
    password = db.StringField()
    phone = db.StringField()
    description = db.StringField()
    sex = db.IntField(default=0)
    avatar = db.StringField(default='')  # the file name of avatar
    school = db.StringField(required=True, default=u"华南师范大学石牌校区")
    province = db.StringField()
    city = db.StringField()
    country = db.StringField()
    create_time = db.IntField(default=int(time()), required=True)
    group = db.IntField(required=True, default=1)
    credits = db.IntField(required=True, default=0)
    # For APP
    wechat = db.EmbeddedDocumentField(WechatOAuth)

    def __unicode__(self):
        return u'{}'.format(self.username)

    @classmethod
    def get_one_user(cls, openid=None, token=None):
        """
        返回一个用户
        :param openid: 用户的微信OPENID
        :param token: 用户当前TOKEN
        :return: None / User实例
        """
        if openid and token:
            this_user = cls.objects(id=openid, wechat__access_token=token)
        elif openid and not token:
            this_user = cls.objects(id=openid)
        elif not openid and token:
            this_user = cls.objects(wechat__access_token=token)
        else:
            return None

        if this_user.count() == 1:
            return this_user.first()

        return None


class UserAddress(db.Document):
    """
    用户收获地址
    """
    name = db.StringField(required=True)
    phone = db.StringField(required=True)
    dormitory = db.StringField(required=True)
    enable = db.BooleanField(required=True, default=True)
    user = db.ReferenceField(User)
    is_default = db.BooleanField(required=True,default=False)
