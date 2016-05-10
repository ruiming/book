# -*- coding: utf-8 -*-

from app import db
from app.auth.model import User
from app.book.model import Book
from time import time


class Comment(db.Document):
    """
    评论模型
    """
    content = db.StringField(required=True)
    star = db.IntField(required=True)
    up = db.IntField(required=True, default=0)
    down = db.IntField(required=True, default=0)

    book = db.ReferenceField(Book)
    user = db.ReferenceField(User)
    create_time = db.IntField(required=True, default=int(time()))
    edit_time = db.IntField()


class UserCommentLove(db.Document):
    """
    用户评论点赞表
    """
    user = db.ReferenceField(User, required=True)
    comment = db.ReferenceField(Comment, required=True)
    type = db.StringField(required=True, default=u'none')
    time = db.IntField(required=True, default=int(time()))


class Points(db.Document):
    """
    积分记录模型
    """
    type = db.IntField(required=True, default=0)
    content = db.StringField()
    point = db.IntField(required=True)
    time = db.IntField(required=True, default=int(time()))
    user = db.ReferenceField(User)


class Collect(db.Document):
    """
    书籍/书单收藏模型
    """
    user = db.ReferenceField(User)
    type = db.StringField()  # 表示是书籍还是书单 ['book', 'booklist']
    type_id = db.StringField()
    time = db.IntField(required=True, default=int(time()))


class Cart(db.Document):
    """
    购物车模型
    """
    book = db.ReferenceField(Book)
    number = db.IntField(required=True, default=0)
    price = db.DecimalField(required=True)
    user = db.ReferenceField(User)
    status = db.IntField(required=True, default=1)  # 1 有效， 0 无效, 2 已提交billing
    create_time = db.IntField(required=True, default=int(time()))
    edit_time = db.IntField(required=True, default=int(time()))


class Billing(db.Document):
    """
    账单模型
    """
    user = db.ReferenceField(User)
    status = db.StringField()
    # 待付款 pending ; 代收货 waiting 带评价 commenting 已评价 done 已取消 canceled
    list = db.ListField(db.ReferenceField(Cart))
    price = db.DecimalField(required=True, default=0.00)
    create_time = db.IntField(required=True, default=int(time()))
    edit_time = db.IntField(required=True, default=int(time()))


class Notice(db.Document):
    """
    通知模型
    """
    content = db.StringField()
    url = db.StringField()
    create_time = db.IntField(default=int(time()))
    is_read = db.BooleanField(default=False)
    read_time = db.IntField()
    user = db.ReferenceField(User)

    def read(self):
        try:
            self.is_read = True
            self.read_time = int(time())
            self.save()
        except:
            return False

        return True


class Feedback(db.Document):
    content = db.StringField(required=True)
    user = db.ReferenceField(User)
    time = db.IntField(required=True, default=int(time()))
