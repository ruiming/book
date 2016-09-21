# -*- coding: utf-8 -*-
from flask import request
from flask_security import RoleMixin, UserMixin

from app import app, db
from app.lib import time_int
from app.lib import save_image


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


class UserInlineCart(db.EmbeddedDocument):
    book_isbn = db.StringField(required=True)
    number = db.IntField(required=True, default=1)


class User(db.Document, UserMixin):
    id = db.StringField(required=True, unique=True, primary_key=True)
    username = db.StringField()

    email = db.StringField()
    password = db.StringField()

    description = db.StringField()

    avatar = db.IntField(default=1)  # the file name of avatar

    school = db.StringField(required=True, default=u"华南师范大学石牌校区")

    create_time = db.IntField(default=time_int, required=True)

    group = db.IntField(required=True, default=1)

    roles = db.ListField(db.ReferenceField(UserRole), default=[])
    credits = db.IntField(required=True, default=0)

    # Carts
    carts = db.EmbeddedDocumentListField(UserInlineCart)

    # TOKEN
    token = db.StringField()

    # FOR REGISTER
    captcha = db.IntField()
    captcha_create_time = db.IntField()
    register_done = db.BooleanField(default=False)

    def __unicode__(self):
        return u'{}'.format(self.username)

    @property
    def full_link_avatar(self):
        return 'https://cdn.bookist.org/avatar/xxx.jpg'.format(self.avatar)

    @property
    def active(self):
        return True

    @classmethod
    def phone_check(cls, phone):
        users = cls.objects(pk=phone, register_done=True)
        if users.count() == 1:
            return False
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
        this_user = cls.objects(token=token)
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
                cart.number = min(cart.number, 10)
                is_added = True
                if cart.number <= 0:
                    carts.remove(cart)
                break

        if not is_added and number > 0:
            carts.append(UserInlineCart(
                book_isbn=isbn,
                number=min(number, 10)
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


class CDNImage(db.EmbeddedDocument):
    url = db.StringField(required=True)
    is_cdn = db.BooleanField(default=False)

    def __str__(self):
        return self.get_full_url()

    def __unicode__(self):
        return self.get_full_url()

    def get_full_url(self):
        if self.is_cdn:
            return '{}/{}'.format(app.config['IMAGE_CDN_BASE_URL'], self.url)
        else:
            if self.url[:4] == 'http':
                return self.url
            else:
                return '/statics/{}'.format(self.url)


class Tag(db.Document):
    name = db.StringField(required=True, unique=True)
    belong = db.StringField()

    def __unicode__(self):
        return u'{}'.format(self.name)


class BookTag(db.EmbeddedDocument):
    name = db.StringField(required=True)

    def __unicode__(self):
        return u'{}'.format(self.name)


class Book(db.Document):
    isbn = db.StringField(required=True, unique=True, primary_key=True)
    title = db.StringField(required=True)
    origin_title = db.StringField()
    subtitle = db.StringField()
    author = db.ListField(db.StringField())
    translator = db.ListField(db.StringField())
    create_time = db.IntField(default=time_int, required=True)
    publish_time = db.StringField()
    image = db.EmbeddedDocumentField(CDNImage, required=True)
    page = db.IntField()
    catelog = db.StringField()
    price = db.DecimalField()
    publisher = db.StringField()
    description = db.StringField()
    author_description = db.StringField()
    tag = db.ListField(db.EmbeddedDocumentField(BookTag))
    binding = db.StringField()
    rate = db.FloatField()
    reason = db.StringField(require=True)

    enabled = db.BooleanField(default=True)

    need_to_refund = db.IntField(default=0)
    need_to_replace = db.IntField(default=0)

    class NotBookInstance(Exception):
        pass

    def __unicode__(self):
        return u'《{}》'.format(self.title)

    def save(self):
        me = super(Book, self).save()
        if not me.image.is_cdn:
            image_url = save_image(me.image.url, str(me.pk))
            me.image.url = image_url
            me.image.is_cdn = True
            me.save()
        return me

    def add_storehouse(self, number, add_type):
        if add_type == 'refund':
            self.need_to_refund += number
            self.save()
        elif add_type == 'replace':
            self.need_to_replace += number
            self.save()


class BookList(db.Document):

    class NotBookListInstance(Exception):
        pass

    title = db.StringField(required=True)
    subtitle = db.StringField()
    description = db.StringField(required=True)
    author = db.ReferenceField(User, required=True)
    tag = db.ListField(db.ReferenceField(Tag))
    books = db.ListField(db.ReferenceField(Book), required=True)
    hot = db.IntField(default=0)
    image = db.EmbeddedDocumentField(CDNImage, required=True)
    collect = db.IntField(default=0, required=True)
    create_time = db.IntField(default=time_int, required=True)
    last_edit_time = db.IntField(default=time_int, required=True)

    def save(self):
        me = super(BookList, self).save()
        if not me.image.is_cdn:
            image_url = save_image(me.image.url, str(me.pk))
            me.image.url = image_url
            me.image.is_cdn = True
            me.save()
        return me


class Activity(db.Document):
    """
    首页活动模型
    """
    image = db.EmbeddedDocumentField(CDNImage, required=True)
    title = db.StringField()
    url = db.StringField()
    enabled = db.BooleanField(required=True, default=True)
    start_time = db.IntField(default=time_int, required=True)
    end_time = db.IntField(required=False)

    def save(self):
        me = super(Activity, self).save()
        if not me.image.is_cdn:
            image_url = save_image(me.image.url, str(me.pk))
            me.image.url = image_url
            me.image.is_cdn = True
            me.save()
        return me


class Application(db.Document):
    """
    API调用者信息
    """
    name = db.StringField(required=True)
    key = db.StringField(required=True, unique=True)
    secret_key = db.StringField(required=True)

    status = db.IntField(required=True, default=1)


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
            return cls.content_array[record_type].get("point", None)

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
        DONE = 'done'

    carts = db.ListField(db.ReferenceField(Cart))
    status = db.StringField(required=True, default=Status.CREATING)  # TODO: status code
    status_list = db.ListField(db.EmbeddedDocumentField(BillingStatus))

    address = db.EmbeddedDocumentField(InlineAddress, required=True)
    user = db.ReferenceField(User, required=True)

    create_time = db.IntField(required=True, default=time_int)
    edit_time = db.IntField(required=True, default=time_int)
    in_purchase_time = db.IntField()

    score_buy = db.IntField()
    score_transport = db.IntField()
    score_service = db.IntField()

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

            if next_status == 'done':
                if self.status in [Billing.Status.RECEIVED]:
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
        price_sum = 0
        for one in self.billings:
            price_sum += one.get_sum_price()
        return price_sum

    def price_real(self):
        price_sum = 0
        for billing in self.billings:
            for cart in billing.carts:
                price_sum += cart.real_price
        return price_sum


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
            if self.create_time - cart.in_after_selling_time in range(0, 6):
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

        self.is_read = True
        self.read_time = time_int()
        self.save()

        return True


class Feedback(db.Document):
    content = db.StringField(required=True)
    user = db.ReferenceField(User)
    time = db.IntField(required=True, default=time_int)
