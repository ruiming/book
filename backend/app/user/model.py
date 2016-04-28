# -*- coding: utf-8 -*-

from app import db
from app.auth.model import User
from app.book.model import Book
from datetime import datetime


class Comment(db.Document):
    """
    评论模型
    """
    _id = db.ObjectIdField(required=False)
    content = db.StringField(required=True)
    star = db.IntField(required=True)
    up = db.IntField(required=True, default=0)
    down = db.IntField(required=True, default=0)

    book = db.ReferenceField(Book)
    user = db.ReferenceField(User)
    create_time = db.DateTimeField(required=True, default=datetime.now())


class UserCommentLove(db.Document):
    """
    用户评论点赞表
    """
    user = db.ReferenceField(User, required=True)
    commentid = db.StringField(required=True)
    type = db.StringField(required=True, default=u'none')
    time = db.DateTimeField(required=True, default=datetime.now())


class Points(db.Document):
    """
    积分记录模型
    """
    type = db.IntField(required=True, default=0)
    content = db.StringField()
    point = db.IntField(required=True)
    time = db.DateTimeField(required=True, default=datetime.now())
    user = db.ReferenceField(User)


class Collect(db.Document):
    """
    书籍/书单收藏模型
    """
    _id = db.ObjectIdField()
    user = db.ReferenceField(User)
    type = db.StringField()  # 表示是书籍还是书单 ['book', 'booklist']
    type_id = db.StringField()
    time = db.DateTimeField(required=True, default=datetime.now())


class Order(db.Document):
    user = db.ReferenceField(User)
    status = db.StringField()
    book = db.ReferenceField(Book)
    price = db.DecimalField(required=True, default=0.00)
    create_time = db.DateTimeField(required=True, default=datetime.now())
    edit_time = db.DateTimeField(required=True, default=datetime.now())
