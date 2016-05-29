# -*- coding: utf-8 -*-

from app import db
from app.auth.model import User, UserAddress
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

    def __unicode__(self):
        return u"《{}》*{}".format(self.book.title, self.number)


class BillingStatus(db.EmbeddedDocument):
    status = db.StringField()
    time = db.IntField(required=True, default=int(time()))
    content = db.StringField()
    backend_operator = db.BooleanField(default=False)

    def __unicode__(self):
        return u'{}|{}|{}'.format(self.status, self.content, self.time)


class Billing(db.Document):
    """
    账单模型
    """
    user = db.ReferenceField(User)
    status = db.StringField()
    # 待付款 pending ; 代收货 waiting 带评价 commenting 已评价 done 已取消 canceled
    status_list = db.ListField(db.EmbeddedDocumentField(BillingStatus))
    list = db.ListField(db.ReferenceField(Cart))
    address = db.ReferenceField(UserAddress)
    price = db.DecimalField(required=True, default=0.00)
    create_time = db.IntField(required=True, default=int(time()))
    edit_time = db.IntField(required=True, default=int(time()))

    class BillingErrorOperator(Exception):
        pass

    def _add_log(self, status, content=""):
        """
        向status_list中添加纪录
        :param status:
        :return:
        """
        self.status_list.append(BillingStatus(
                status=status,
                content=content
            ))
        self.save()

    def change_status_force(self, status, content):
        """
        修改订单状态
        :param status: 强制转换的状态
        :param content: 记录的信息
        :return:
        """
        self._add_log(status, content)
        self.status = status
        self.edit_time = int(time())
        self.save()

    def change_status(self, next_status, content="", backend=False):
        """
        修改订单状态
        :param next_status: 下一个状态
        :param content: 状态信息
        :param backend: 是否后台操作，区分用户合管理操作
        :return: True or BillingErrorOperator
        """
        # TODO: 完善状态更新的内容
        if backend:
            pass
        else:
            if next_status == 'canceled':  # 取消订单
                # pending
                if self.status in ['pending']:
                    self.status = next_status
                    self._add_log(next_status, content)
                    self.save()
                    return True

            if next_status == 'commenting':  # 进入 已收货/待评价 状态
                # waiting
                if self.status in ['waiting']:
                    self.status = next_status
                    self._add_log(next_status, content)
                    self.save()
                    return True

            if next_status in ['refund', 'replace']:  # 进入 退款、退货 状态
                # done, replaced, refund_refused, replace_refused
                # TODO: refund_refused, replace_refused 是否还能重新进入售后
                if self.status in ['done', 'replaced']:
                    self.status = next_status
                    self._add_log(next_status, content)
                    self.save()
                    return True



            raise self.BillingErrorOperator


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
