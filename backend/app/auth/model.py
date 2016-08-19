# -*- coding: utf-8 -*-
from app import db
from time import time
from flask_security import RoleMixin, UserMixin
from flask import request

class User(db.Document):
    pass


class UserRole(db.Document, RoleMixin):
    """
    用户权限
    """
    name = db.StringField(unique=True)
    description = db.StringField()

    def __unicode__(self):

        return u'{}'.format(self.description)


class WechatOAuth(db.EmbeddedDocument):
    access_token = db.StringField()
    expires_in = db.IntField()
    refresh_token = db.StringField()
    token_time = db.IntField()


class UserTypeBookList(db.Document):
    tag = db.StringField()
    user = db.ReferenceField(User)
    times = db.IntField(required=True, default=1)
    create_time = db.IntField(required=True, default=int(time()))
    last_time = db.IntField(required=True, default=int(time()))

    class TooManyRecord(Exception):
        pass

    @classmethod
    def new_or_add(cls, tag, user):
        """
        新增一条记录或者增加1
        :param tag: 标签名称
        :param user: User 实例
        :return: None
        """
        user_type = cls.objects(tag=tag, user=user)
        if user_type.count() == 1:
            user_type = user_type.first()
            user_type.times += 1
            user_type.last_time = int(time())
            user_type.save()
        elif user_type.count() == 0:
            cls(
                tag=tag,
                user=user
            ).save()
        else:
            raise cls.TooManyRecord


class UserTypeBook(db.Document):
    type = db.StringField()
    value = db.StringField()
    user = db.ReferenceField(User)
    times = db.IntField(required=True, default=1)
    create_time = db.IntField(required=True, default=int(time()))
    last_time = db.IntField(required=True, default=int(time()))

    class RecordType:
        Author = 'author'
        Translator = 'translator'
        Tag = 'tag'

    class UnknownRecordType(Exception):
        pass

    @classmethod
    def new_or_add(cls, type, value, user):

        user_type = cls.objects(type=type, value=value, user=user)
        if user_type.count() == 1:
            user_type = user_type.first()
            user_type.times += 1
            user_type.last_time = int(time())
            user_type.save()
        elif user_type.count() == 0:
            cls(
                type=type,
                value=value,
                user=user
            ).save()
        else:
            raise cls.TooManyRecord


class UserInlineCart(db.EmbeddedDocument):
    book_isbn = db.StringField(required=True)
    number = db.IntField(required=True, default=1)


class User(db.Document, UserMixin):

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
    roles = db.ListField(db.ReferenceField(UserRole), default=[])
    credits = db.IntField(required=True, default=0)
    # For APP
    wechat = db.EmbeddedDocumentField(WechatOAuth)
    # Carts
    carts = db.EmbeddedDocumentListField(UserInlineCart)

    def __unicode__(self):
        return u'{}'.format(self.username)

    @property
    def active(self):
        return True

    @classmethod
    def get_user_on_headers(cls):
        """
        直接读取 headers TOKEN 返回一个User示例
        ** 危险度高,慎用 **
        :return: None / User实例
        """
        token = request.headers.get('token', None)
        if not token:
            return None
        this_user = cls.objects(wechat__access_token=token)
        if this_user.count() == 1:
            return this_user.first()
        return None

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

    def add_cart(self, isbn, number=1):
        is_added = False
        carts = list(self.carts)
        for cart in carts:
            if cart.book_isbn == str(isbn):
                cart.number += number
                is_added = True
                if cart.number <= 0:
                    carts.remove(cart)
                break

        if not is_added and number>0:
            carts.append(UserInlineCart(
                book_isbn=isbn,
                number=number
            ))
        self.carts = carts
        self.save()


class UserAddress(db.Document):
    """
    用户收获地址
    """
    name = db.StringField(required=True)
    phone = db.StringField(required=True)
    dormitory = db.StringField(required=True)
    enabled = db.BooleanField(required=True, default=True)
    user = db.ReferenceField(User)
    is_default = db.BooleanField(required=True, default=False)

    def __unicode__(self):
        return u"{}\n{}\n{}".format(self.name, self.phone, self.dormitory)
