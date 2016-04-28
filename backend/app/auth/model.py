# -*- coding: utf-8 -*-
from app import db
from datetime import datetime


class WechatOAuth(db.EmbeddedDocument):
    access_token = db.StringField()
    expires_in = db.IntField()
    refresh_token = db.StringField()
    token_time = db.IntField()


class User(db.Document):

    wechat_openid = db.StringField(required=True, unique=True)
    email = db.StringField()
    username = db.StringField(required=True)
    password = db.StringField()
    wechat = db.StringField()
    phone = db.StringField()
    description = db.StringField()
    sex = db.IntField()
    avatar = db.StringField()  # the file name of avatar
    school = db.StringField(required=True, default=u"华南师范大学石牌校区")
    dormitory = db.StringField()
    province = db.StringField()
    city = db.StringField()
    country = db.StringField()
    create_time = db.DateTimeField(default=datetime.now(), required=True)
    group = db.IntField(required=True, default=1)
    credits = db.IntField(required=True, default=0)
    # For APP
    wechat = db.EmbeddedDocumentField(WechatOAuth)

    def __unicode__(self):
        return u'{}'.format(self.username)