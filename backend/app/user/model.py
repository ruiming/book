# -*- coding: utf-8 -*-

from app import db
from app.auth.model import User, UserAddress
from app.book.model import Book, BookList
from app.lib import time_int


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
    create_time = db.IntField(required=True, default=time_int)
    edit_time = db.IntField()


class UserCommentLove(db.Document):
    """
    用户评论点赞表
    """
    user = db.ReferenceField(User, required=True)
    comment = db.ReferenceField(Comment, required=True)
    type = db.StringField(required=True, default=u'none')
    time = db.IntField(required=True, default=time_int)


class BookListComment(db.Document):
    """
    书单评论模型
    """
    content = db.StringField(required=True)
    star = db.IntField(required=True)
    up = db.IntField(required=True, default=0)
    down = db.IntField(required=True, default=0)

    book_list = db.ReferenceField(BookList)
    user = db.ReferenceField(User)
    create_time = db.IntField(required=True, default=time_int)
    edit_time = db.IntField()


class UserBookListCommentLove(db.Document):
    """
    用户评论点赞表
    """
    user = db.ReferenceField(User, required=True)
    comment = db.ReferenceField(BookListComment, required=True)
    type = db.StringField(required=True, default=u'none')
    time = db.IntField(required=True, default=time_int)


class UserBookListLove(db.Document):
    """
    用户书单点赞
    """
    book_list = db.ReferenceField(BookList)
    time = db.IntField(required=True, default=time_int)
    user = db.ReferenceField(User, required=True)


class Points(db.Document):
    """
    积分记录模型
    """
    type = db.IntField(required=True, default=0)
    content = db.StringField()
    point = db.IntField(required=True)
    time = db.IntField(required=True, default=time_int)
    user = db.ReferenceField(User)


    class PointType:
        DEFAULT = 0
        FIRST_LOGIN = 1
        FIRST_BUY = 2
        BUY_A_BOOK = 3
        COMMENT = 4
        COMMENT_TO_TOP = 5

        content_array = {
            DEFAULT: {
                "one_time_behavior": False,
                "point": 0,
                "content": u"系统奖励"
            },

            FIRST_LOGIN: {
                "one_time_behavior": True,
                "point": 100,
                "content": u"首次登录"
            },
            FIRST_BUY: {
                "one_time_behavior": True,
                "point": 50,
                "content": u"首次购书"
            },
            BUY_A_BOOK: {
                "one_time_behavior": False,
                "point": 10,
                "content": u"购书"
            },
            COMMENT: {
                "one_time_behavior": False,
                "point": 2,
                "content": u"评论"
            },
            COMMENT_TO_TOP: {
                "one_time_behavior": False,
                "point": 20,
                "content": u"评论被置顶"
            },
        }

        @classmethod
        def is_one_time_behavior(cls, record_type):
            return cls.content_array[record_type].get('one_time_behavior', None)

        @classmethod
        def type_content(cls, record_type):
            return cls.content_array[record_type].get('content', None)

        @classmethod
        def type_point(cls, record_type):
            return cls.content_array[record_type].get('point', None)

    @classmethod
    def add_record(cls, user, record_type, point=0, content=u""):

        if cls.PointType.is_one_time_behavior(record_type):
            if cls.objects(type=record_type, user=user).count == 0:
                cls(
                    type=record_type,
                    cotent=content or cls.PointType.type_content(record_type),
                    point=point or cls.PointType.type_point(record_type),
                    user=user
                ).save()
                user.credits += point
                user.save()

        else:
            cls(
                type=record_type,
                content=content or cls.PointType.type_content(record_type),
                point=point or cls.PointType.type_point(record_type),
                user=user
            ).save()
            user.credits += point
            user.save()


class Collect(db.Document):
    """
    书籍/书单收藏模型
    """
    user = db.ReferenceField(User)
    type = db.StringField()  # 表示是书籍还是书单 ['book', 'booklist']
    type_id = db.StringField()
    time = db.IntField(required=True, default=time_int)

    @classmethod
    def sum(cls, object_instance):
        if isinstance(object_instance, Book):
            return cls.objects(type="book", type_id=object_instance.isbn).count()
        elif isinstance(object_instance, BookList):
            return cls.objects(type="booklist", type_id=str(object_instance.pk)).count()
        return 0


class BillingStatus(db.EmbeddedDocument):
    status = db.StringField()
    time = db.IntField(required=True, default=time_int)
    content = db.StringField()
    backend_operator = db.BooleanField(default=False)

    def __unicode__(self):
        return u'{}|{}|{}'.format(self.status, self.content, self.time)


class Storehouse(db.Document):
    """
    储存中的书籍
    """
    STATUS_NORMAL = 0
    STATUS_PROCESSING = 1
    STATUS_RETURNED = 2
    STATUS_IN_ENTREPOT = 3

    book = db.ReferenceField(Book)
    price = db.DecimalField(required=True)
    real_price = db.DecimalField()

    create_time = db.IntField(required=True, default=time_int)

    status = db.IntField(required=True, default=STATUS_NORMAL)
    status_changed_time = db.IntField()
    source = db.StringField()  # 来源地

    def __eq__(self, other):
        if isinstance(other, Cart):
            if self.book == other.book and self.price == self.price and self.status == other.status:
                return True
        return False


class Cart(db.Document):
    """
    订单中书籍
    """
    STATUS_NORMAL = 0  # 正常状态
    STATUS_REPLACE_PROCESSING = 1  # 退货处理中
    STATUS_REPLACE_END = 2  # 退货结束
    STATUS_REFUND_PROCESSING = 3  # 换货处理中
    STATUS_REFUND_END = 4  # 换货借宿
    STATUS_CANCELED = 5

    book = db.ReferenceField(Book)
    price = db.DecimalField(required=True)
    real_price = db.DecimalField()
    create_time = db.IntField(required=True, default=time_int)

    status = db.IntField(required=True, default=STATUS_NORMAL)
    in_after_selling_time = db.IntField()
    status_changed_time = db.IntField()

    user = db.ReferenceField(User)

    def __unicode__(self):
        return u'<Cart id({}) <{}> ${}>'.format(str(self.pk), self.book.title, self.price)

    def __eq__(self, other):
        if isinstance(other, Cart):
            if self.book == other.book \
                    and self.price == other.price \
                    and self.status == other.status:
                if self.status != self.STATUS_NORMAL:
                    if self.in_after_selling_time == other.in_after_selling_time \
                            and self.status_changed_time == other.status_changed_time:
                        return True
                    else:
                        return False
                else:

                    return True

        return False

    def change_status(self, next_status):
        self.status = next_status
        self.status_changed_time = time_int()
        self.save()

    @classmethod
    def status_to_string(cls, index):
        status = {
            "0": "STATUS_NORMAL",
            "1": "STATUS_REPLACE_PROCESSING",
            "2": "STATUS_REPLACE_END",
            "3": "STATUS_REFUND_PROCESSING",
            "4": "STATUS_REFUND_END",
        }
        return status.get(str(index))


class InlineAddress(db.EmbeddedDocument):
    """
    用户订单中的内嵌地址
    """
    name = db.StringField(required=True)
    phone = db.StringField(required=True)
    dormitory = db.StringField(required=True)


class Billing(db.Document):
    """
    订单
    """
    class Status:
        CREATING = "creating"
        PENDING = "pending"
        WAITING = "waiting"
        RECEIVED = "received"
        CANCELED = 'canceled'

    carts = db.ListField(db.ReferenceField(Cart))
    status = db.StringField(required=True, default=Status.CREATING)  # TODO: status code
    status_list = db.ListField(db.EmbeddedDocumentField(BillingStatus))

    address = db.EmbeddedDocumentField(InlineAddress, required=True)
    user = db.ReferenceField(User, required=True)

    create_time = db.IntField(required=True, default=time_int)
    edit_time = db.IntField(required=True, default=time_int)
    in_purchase_time = db.IntField()

    @property
    def replace_refund_processing(self):
        """
        该订单中是否有书籍处于退换货状态中。
        :return: Boolean
        """
        for cart in self.carts:
            if cart.status not in[Cart.STATUS_NORMAL,
                                  Cart.STATUS_REFUND_END,
                                  Cart.STATUS_REPLACE_END]:
                return True
        return False

    def get_sum_price(self):
        sum_price = 0
        for cart in self.carts:
            sum_price += cart.price

        return sum_price

    class BillingErrorOperator(Exception):
        pass

    def carts_info(self):
        carts = []
        for cart in self.carts:
            is_added = False
            for s_cart in carts:
                if cart in s_cart:
                    s_cart[1] += 1
                    is_added = True
                    break
            if not is_added:
                carts.append([cart, 1])
        return carts

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

    def add_log_backend(self, status, content=""):
        """
        向status_list中添加纪录
        :param status:
        :param content:
        :return:
        """
        self.status_list.append(BillingStatus(
                status=status,
                content=content,
                backend_operator=True,
            ))
        self.status = status
        self.edit_time = time_int()
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
        self.edit_time = time_int()
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
                if self.status in ['done', 'replaced']:
                    self.status = next_status
                    self._add_log(next_status, content)
                    self.save()
                    return True

            raise self.BillingErrorOperator


class Purchase(db.Document):
    billings = db.ListField(db.ReferenceField(Billing))

    operator = db.StringField(required=True)
    warehouse = db.StringField(required=True)

    source = db.StringField(required=True)

    create_time = db.IntField(required=True, default=time_int)

    def price(self):
        sum = 0
        for one in self.billings:
            sum += one.get_sum_price()
        return sum

    def price_real(self):
        sum = 0
        for billing in self.billings:
            for cart in billing.carts:
                sum += cart.real_price
        return sum


class AfterSellBilling(db.Document):

    REPLACE = 1
    REFUND = 2

    WAITING = 'waiting'
    PROCESSING = 'processing'
    REFUSED = 'refused'
    DONE = 'done'

    billing = db.ReferenceField(Billing, required=True)
    isbn = db.StringField(required=True)
    number = db.IntField(required=True, default=1)
    type = db.IntField(required=True)
    reason = db.StringField()
    is_done = db.BooleanField(default=False)  # 售后账单是否完成
    canceled = db.BooleanField(default=False)  # 售后账单是否已经取消
    user = db.ReferenceField(User, required=True)
    create_time = db.IntField(required=True, default=time_int)
    process = db.StringField(default=WAITING)
    process_change_time = db.IntField()
    feedback = db.EmbeddedDocumentListField(BillingStatus)

    def change_process_status(self, next_process):
        self.process = next_process
        self.process_change_time = time_int()
        self.save()

    @classmethod
    def status_to_string(cls, index):
        status = {
            "1": "REPLACE",
            "2": "REFUND",
        }
        return status.get(str(index))

    def save(self):
        super(AfterSellBilling, self).save()
        if not self.process_change_time:
            self.process_change_time = self.create_time
            self.save()
        return self

    def get_cart(self):
        """
        从 billing 中找出属于该售后订单的 Cart
        :return: Cart list
        """
        all_carts = self.billing.carts
        this_after_selling_carts = []
        for cart in all_carts:
            if cart.in_after_selling_time <= self.create_time and cart.in_after_selling_time > self.create_time - 5:
                this_after_selling_carts.append(cart)
        return this_after_selling_carts


class Notice(db.Document):
    """
    通知模型
    """
    title = db.StringField(required=True)
    content = db.StringField(required=True)
    url = db.StringField()
    create_time = db.IntField(default=time_int)
    is_read = db.BooleanField(default=False)
    read_time = db.IntField()
    user = db.ReferenceField(User, required=True)

    def read(self):
        try:
            self.is_read = True
            self.read_time = time_int()
            self.save()
        except:
            return False

        return True


class Feedback(db.Document):
    content = db.StringField(required=True)
    user = db.ReferenceField(User)
    time = db.IntField(required=True, default=time_int)
