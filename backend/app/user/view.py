# -*- coding: utf-8 -*-

from flask import Blueprint, jsonify, request

from app.auth.model import User, UserAddress
from app.book.model import Book, BookList
from app.user.model import Comment, Points, UserCommentLove, Collect, Billing, Notice, Cart, Feedback, BillingStatus, \
    UserBookListLove, BookListComment, UserBookListCommentLove

from app.lib.common_function import return_message, token_verify
from app.lib.api_function import allow_cross_domain
from app.lib.wechat import oauth4api

from time import time


user_module = Blueprint('user_module', __name__)


@user_module.route('/comments', methods=['GET'])
@allow_cross_domain
@oauth4api
def comments():
    """
    返回书籍所有评论
    """
    isbn = request.args.get('isbn', None)

    this_book = Book.objects(isbn=isbn)
    this_book = this_book.first() if this_book.count() == 1 else None
    if this_book is None:
        return return_message('error', 111)

    page = request.args.get('page', 1)
    try:
        page = int(page)
    except:
        return return_message('error', 107)

    this_user = User.get_one_user(openid=request.headers['userid'])

    all_comment = Comment.objects(book=this_book).order_by("create_time").limit(5).skip(5*(page-1))

    all_comment_json = []

    for one in all_comment:
        up_already = True if UserCommentLove.objects(user=this_user, comment=one, type='up').count() == 1 else False
        down_already = True if UserCommentLove.objects(user=this_user, comment=one, type='down').count() == 1 else False
        all_comment_json.append({
            'id': str(one.pk),
            'content': one.content,
            'star': one.star,
            'up': one.up,
            'down': one.down,
            'up_already': up_already,
            'down_already': down_already,
            'user': {
                'avatar': one.user.avatar,
                'username': one.user.username
            },
            'create_time': one.create_time
        })

    return return_message('success', 201, all_comment_json)


@user_module.route('/comment', methods=['POST', 'PUT', 'DELETE'])
@allow_cross_domain
@oauth4api
def comment():
    """
    发布评论
    """
    if request.method == 'POST':
        token = request.form.get('token', None)
        isbn = request.form.get('isbn', None)
        content = request.form.get('content', None)
        star = request.form.get('star', None)
        if isinstance(star, int):
            star = min(int(star), 10)

        if not star:
            return return_message('error', 202)

        if isbn is None or content is None or star is None:
            return return_message('error', 203)

        this_book = Book.objects(isbn=isbn)
        this_book = this_book.first() if this_book.count() == 1 else None

        if this_book is None:
            return return_message('error', 111)

        this_user = User.get_one_user(openid=request.headers['userid'])

        this_comment = Comment(
            content=content,
            star=star,
            book=this_book,
            user=this_user

        ).save()

        Points.add_record(
            user=this_user,
            record_type=Points.PointType.COMMENT,
        )

        this_comment_json = {
            'id': str(this_comment.pk),
            'content': this_comment.content,
            'star': this_comment.star,
            'up': this_comment.up,
            'up_already': False,
            'down': this_comment.down,
            'down_already': False,
            'create_time': this_comment.create_time
        }
        return return_message('success', 204, this_comment_json)

    elif request.method == 'PUT':
        """
        提交评论点赞/ 修改评论
        """

        id = request.form.get('id', None)
        type = request.form.get('type', 'up')

        if id is not None:
            if len(id) != 24:
                id = None

        if type not in ['up', 'down', 'edit']:
            return return_message('error', 205)

        if id is None:
            return return_message('error', 206)
        else:

            this_comment = Comment.objects(pk=id)
            if this_comment.count() != 1:
                return return_message('error', 206)
            else:
                this_comment = this_comment.first()

        this_user = User.get_one_user(openid=request.headers['userid'])


        if type == 'edit':

            content = request.form.get("content", None)
            star = request.form.get('star', 0)
            try:
                star = min(int(star), 10)
            except:
                return return_message("error", 202)

            this_comment.content = content
            this_comment.star = star
            this_comment.edit_time = int(time())
            this_comment.save()

            return return_message('success', 207)

        this_user_comment_love = UserCommentLove.objects(user=this_user, comment=this_comment)

        if this_user_comment_love.count() == 1:
            # 存在记录
            this_user_comment_love = this_user_comment_love.first()

            if type == this_user_comment_love.type:
                # 与数据库相同 == 删除
                this_comment[this_user_comment_love.type] -= 1
                this_comment.save()
                this_user_comment_love.delete()
                return return_message('success', 208)
            else:
                # 与数据库的不相同
                this_comment[this_user_comment_love.type] -= 1

                this_comment[type] += 1
                this_user_comment_love.type = type

                this_comment.save()
                this_user_comment_love.save()
                return return_message('success', 209)
        else:
            # 不存在记录，添加纪录

            UserCommentLove(
                user=this_user,
                comment=this_comment,
                type=type
            ).save()
            this_comment[type] += 1
            this_comment.save()
            return return_message('success', 210)

    elif request.method == 'DELETE':

        id = request.form.get('id', None)

        this_user = User.get_one_user(openid=request.headers['userid'])

        if not id or len(id) != 24 or Comment.objects(pk=id).count() != 1:
            return return_message('error', 206)

        this_comment = Comment.objects(user=this_user, pk=id).first()
        if isinstance(this_comment, Comment):
            all_user_comment_love = UserCommentLove.objects(comment=this_comment)
            for one_love in all_user_comment_love:
                one_love.delete()

            this_comment.delete()
        return return_message('success', 211)


@user_module.route('/collect', methods=['POST', 'DELETE'])
@allow_cross_domain
@oauth4api
def collect():
    def istance_objects(type, id):
        if type == 'book':
            if Book.objects(isbn=id).count() == 1:
                return True
            else: False
        elif type == 'booklist':
            if len(id) == 24:
                if BookList.objects(pk=id).count() == 1:
                    return True
                else:
                    return False

        return False

    if request.method == 'POST':
        """
        提交收藏信息
        """
        type = request.form.get('type', None)  # 收藏类型
        id = request.form.get('id', None)  # booklist 所需
        isbn = request.form.get('isbn', None)  # book 所需

        if type not in ['book', 'booklist']:
            return return_message('error', 212)

        if type == 'book':
            id = isbn

        this_user = User.get_one_user(openid=request.headers['userid'])

        insert_list = []
        cancel_list = []
        try:
            id_list = id.split(',')
            for one_id in id_list:

                if not istance_objects(type, one_id):
                    raise Exception

                collect = Collect.objects(user=this_user, type=type, type_id=one_id)

                if collect.count() == 0:
                    insert_list.append(one_id)
                elif collect.count() == 1:
                    cancel_list.append(collect.first())
                else:
                    raise Exception
        except:
            return return_message('error', 213)

        for one in insert_list:
            Collect(user=this_user, type=type, type_id=one).save()

            # TODO: 重新设计 书单的收藏数。
            if type == 'booklist':
                this_booklist = BookList.objects(pk=id).first()
                this_booklist.collect += 1
                this_booklist.save()

        for one in cancel_list:
            if one.type == 'booklist':
                this_booklist = BookList.objects(pk=id).first()
                this_booklist.collect -= 1
                this_booklist.save()
            one.delete()

        return return_message('success', 214)

    elif request.method == 'DELETE':
        # 抛弃
        """
        删除收藏信息
        """
        id = request.form.get('id', None)

        if len(id) != 24:
            return return_message('error', 213)

        this_user = User.get_one_user(openid=request.headers['userid'])

        is_inserted = Collect.objects(pk=id).count()

        if is_inserted == 0:
            return return_message('success', 215)
        elif is_inserted == 1:
            this_collect = Collect.objects(pk=id).first()
            if this_collect.type == 'booklist':
                this_booklist = BookList.objects(pk=id).first()
                this_booklist.collect -= 1
                this_booklist.save()
            Collect.objects(pk=id).delete()

            return return_message('success', 215)
        else:
            # logger
            return return_message('error', 400)


@user_module.route('/cart', methods=['POST', 'PUT', 'DELETE'])
@allow_cross_domain
@oauth4api
def cart():
    if request.method == 'POST':
        """
        提交一个购物车
        """

        isbn = request.form.get('isbn', None)
        if not isbn:
            return return_message('error', 110)
        this_book = Book.objects(isbn=isbn)
        if this_book.count() != 1:
            return return_message('error', 111)
        else:
            this_book = this_book.first()

        number = request.form.get('number', 1)
        try:
            number = min(int(number), 10)
        except:
            number = 1
        this_user = User.get_one_user(openid=request.headers['userid'])

        this_cart = Cart.objects(book=this_book, status=1, user=this_user)
        if this_cart.count() == 1:
            this_cart = this_cart.first()
            this_cart.number += number
            this_cart.number = min(this_cart.number, 10)
            this_cart.edit_time = int(time())
            this_cart.save()
        else:

            this_cart = Cart(
                book=this_book,
                number=number,
                price=this_book.price,
                user=this_user,
            )
            this_cart.save()

        return return_message('success', 216, str(this_cart.pk))

    elif request.method == 'PUT':
        """
        修改一个购物车
        """
        number = request.form.get('number', None)
        try:
            number = int(number)
            number = min(10, number)
        except:
            return return_message('error', 217)

        status = request.form.get('status', 1)

        if status not in [0, 1]:
            return return_message('error', 218)

        this_user = User.get_one_user(openid=request.headers['userid'])

        isbn = request.form.get('isbn', None)
        if not isbn:
            return return_message('error', 110)
        this_book = Book.objects(isbn=isbn)
        if this_book.count() != 1:
            return return_message('error', 111)
        else:
            this_book = this_book.first()

        this_cart = Cart.objects(book=this_book, status=1, user=this_user)
        if this_cart.count() != 1:
            return return_message('error', 219)
        this_cart = this_cart.first()

        this_cart.status = status
        this_cart.number = number
        this_cart.save()

        return return_message('success', 220)

    elif request.method == 'DELETE':
        """
        删除一个购物车
        """

        this_user = User.get_one_user(openid=request.headers['userid'])

        isbn = request.form.get('isbn', None)
        if not isbn:
            return return_message('error', 110)


        all_cart = []

        try:
            isbn_list = isbn.split(',')
            for one_isbn in isbn_list:
                if Book.objects(isbn=one_isbn).count() != 1:
                    raise Exception

                this_cart = Cart.objects(book=Book.objects(isbn=one_isbn).first(), status=1, user=this_user)
                if this_cart.count() != 1:
                    raise Exception
                this_cart = this_cart.first()

                all_cart.append(this_cart)
        except:
            return return_message('error', 219)

        for one_cart in all_cart:
            one_cart.status = 0
            one_cart.save()

        return return_message('success', 221)


@user_module.route('/billing', methods=['GET', 'POST', 'PUT', 'DELETE'])
@allow_cross_domain
@oauth4api
def billing():

    this_user = User.get_one_user(openid=request.headers['userid'])

    if request.method == 'GET':
        """
        查看一个订单状态
        """

        id = request.args.get('id', None)

        if not id or len(id) != 24:
            return return_message('error', 222)

        this_billing = Billing.objects(pk=id, user=this_user)
        if this_billing.count() != 1:
            return return_message('error', 222)
        else:
            this_billing = this_billing.first()

        this_billing_json = {
            'id': str(this_billing.pk),
            'status': this_billing.status,
            'status_list': [{
                'status': one.status,
                'content': one.content,
                'time': str(one.time),
                'backend': one.backend_operator
                            } for one in this_billing.status_list],
            'carts': [{
                'id': str(one_cart.pk),
                'number': one_cart.number,
                'price': str(one_cart.price),
                'book': {
                    'isbn': one_cart.book.isbn,
                    'title': one_cart.book.title,
                    'image': one_cart.book.image,
                    'author': [one_author for one_author in one_cart.book.author],
                }
                      } for one_cart in this_billing.list],
            'address': {
                'name': this_billing.address.name,
                'phone': this_billing.address.phone,
                'dormitory': this_billing.address.dormitory
            }
        }
        return return_message('success', 223, this_billing_json)

    elif request.method == 'POST':
        """
        提交一个订单
        """
        carts = request.form.get('cart_list', None)

        address_id = request.form.get('address_id', None)
        if not address_id or len(address_id) != 24:
            return return_message('error', 224)

        this_user_address = UserAddress.objects(pk=address_id, user=this_user,  enabled=True)
        if this_user_address.count() != 1:
            return return_message('error', 224)
        else:
            this_user_address = this_user_address.first()

        all_cart = []

        try:
            cart_list = carts.split(',')
            for one_cart in cart_list:
                this_cart = Cart.objects(pk=one_cart, user=this_user)
                if this_cart.count() != 1:
                    raise Exception
                this_cart = this_cart.first()
                all_cart.append(this_cart)
        except:
            return return_message('error', 222)

        # 计算订单总价
        price_sum = 0

        for one_cart in all_cart:

            price_sum += (one_cart.price * one_cart.number)
            one_cart.status = 2
            one_cart.save()

        # 入库
        this_billing = Billing(
            user=this_user,
            status='pending',
            list=all_cart,
            address=this_user_address,
            price=price_sum,
            status_list=[BillingStatus(
                status='create',
                content=u'创建订单'
            ), BillingStatus(
                status='pending',
                content=u'待发货'
            )]
        ).save()
        return return_message('success', 225, str(this_billing.pk))

    elif request.method == 'PUT':
        """
        修改一个订单
        """
        pass
        id = request.form.get('id', None)
        try:
            this_billing = Billing.objects(pk=id, user=this_user)
            if this_billing.count() != 1:
                raise Exception
            this_billing = this_billing.first()
        except:
            return return_message('error', 222)

        status = request.form.get('status', None)

        if status not in ['waiting', 'commenting', 'done', 'refund']:
            return return_message('error', 226)

        try:
            this_billing.change_status(status)
        except Billing.BillingErrorOperator:
            return return_message('error', 227)

        return return_message('success', 228)

    elif request.method == 'DELETE':
        """
        取消一个订单
        """
        id = request.form.get('id', None)
        try:
            this_billing = Billing.objects(pk=id, user=this_user)
            if this_billing.count() != 1:
                raise Exception
            this_billing = this_billing.first()
        except:
            return return_message('error', 222)

        try:
            this_billing.change_status('canceled')
        except:
            return return_message('error', 229)

        return return_message('success', 230)


@user_module.route('/booklist_love', methods=['POST'])
@allow_cross_domain
@oauth4api
def booklist_love():

    this_user = User.get_one_user(openid=request.headers['userid'])

    if request.method == 'POST':
        booklist_id = request.form.get('id', None)
        if not booklist_id or len(booklist_id) != 24:
            return return_message('error', 115)

        this_booklist = BookList.objects(pk=booklist_id)
        if this_booklist.count() != 1:
            return return_message('error', 115)

        this_booklist = this_booklist.first()

        is_love = UserBookListLove.objects(book_list=this_booklist, user=this_user)

        if is_love.count() == 1:
            # 已点赞 应该取消
            this = is_love.first()
            this.delete()
            return return_message('success', 231)

        elif is_love.count() == 0:
            # 未点赞 应该添加
            UserBookListLove(book_list=this_booklist, user=this_user).save()
            return return_message('success', 232)
        else:
            # 异常 logger
            return return_message('error', 400)


@user_module.route('/user_info', methods=['GET'])
@allow_cross_domain
@oauth4api
def user_info():

    this_user = User.get_one_user(openid=request.headers['userid'], token=request.headers['token'])
    this_user_info = {
        'username': this_user.username,
        'avatar': this_user.avatar or '',
        'sex': this_user.sex,
        'unread_notice': Notice.objects(user=this_user, is_read=False).count(),
        'cart_num': Cart.objects(user=this_user, status=1).count(),
        'billing_pending_num': Billing.objects(user=this_user, status='pending').count(),
        'billing_commenting_num': Billing.objects(user=this_user, status='commenting').count()
    }
    return return_message('success', 233, this_user_info)


@user_module.route('/user_address', methods=['GET', 'POST', 'PUT', 'DELETE'])
@allow_cross_domain
@oauth4api
def user_address():

    this_user = User.get_one_user(openid=request.headers['userid'])

    if request.method == 'GET':

        type = request.args.get('type', None)
        if type == 'default':
            all_user_address = UserAddress.objects(user=this_user, enabled=True, is_default=True)

            if all_user_address.count() == 0:
                all_user_address = UserAddress.objects(user=this_user, enabled=True)

            all_user_address = [all_user_address.first()]
        else:
            all_user_address = UserAddress.objects(user=this_user, enabled=True)

        address_list = []
        for one_address in all_user_address:
            if one_address.enabled:
                address_list.append({
                    'id': str(one_address.pk),
                    'name': one_address.name,
                    'phone': one_address.phone,
                    'dormitory': one_address.dormitory,
                    'is_default': one_address.is_default
                })

        return return_message('success', 234, address_list, data_required=True)

    elif request.method == 'POST':

        name = request.form.get('name', None)
        phone = request.form.get('phone', None)

        try:
            if len(phone) != 11:
                raise Exception
            phone = int(phone)

        except:
            return return_message('error', 235)

        dormitory = request.form.get('dormitory', None)

        if not name or not phone or not dormitory:
            return return_message('error', 236)

        type = request.form.get('type', None)

        if UserAddress.objects(user=this_user, enabled=True, is_default=True).count() == 0:
            this_user_address = UserAddress(
                name=name,
                phone=str(phone),
                dormitory=dormitory,
                user=this_user,
                is_default=True
            ).save()
        else:
            this_user_address = UserAddress(
                name=name,
                phone=str(phone),
                dormitory=dormitory,
                user=this_user,
            ).save()




        if type == 'default':
            all_default_address = UserAddress.objects(user=this_user, enabled=True, is_default=True)
            for one in all_default_address:
                one.is_default = False
                one.save()

            this_user_address.is_default = True
            this_user_address.save()

        return return_message('success', 237)

    elif request.method == 'PUT':
        """
        修改一个用户地址
        """
        name = request.form.get('name', None)
        phone = request.form.get('phone', None)

        try:
            if len(phone) != 11:
                raise Exception
            phone = int(phone)

        except:
            return return_message('error', 235)

        dormitory = request.form.get('dormitory', None)

        id = request.form.get('id', None)
        if not id or len(id) != 24:
            return return_message('error', 238)

        this_user_address = UserAddress.objects(pk=id, user=this_user, enabled=True)
        if this_user_address.count() != 1:
            return return_message('error', 238)
        else:
            this_user_address = this_user_address.first()

        if not name or not phone or not dormitory:
            return return_message('error', 236)

        type = request.form.get('type', None)

        this_user_address.name = name
        this_user_address.phone = str(phone)
        this_user_address.dormitory = dormitory

        if type == 'default':
            all_default_address = UserAddress.objects(user=this_user, enabled=True, is_default=True)
            for one in all_default_address:
                one.is_default = False
                one.save()
            this_user_address.is_default = True
        this_user_address.save()

        return return_message('success', 239)

    elif request.method == 'DELETE':

        id = request.form.get('id', None)
        if not id or len(id) != 24:
            return return_message('error', 238)

        this_user_address = UserAddress.objects(pk=id, user=this_user, enabled=True)
        if this_user_address.count() != 1:
            return return_message('error', 238)
        else:
            this_user_address = this_user_address.first()

        this_user_address.enabled = False
        this_user_address.save()

        if this_user_address.is_default:
            this_user_address.is_default = False
            all_not_default_address = UserAddress.objects(user=this_user, enabled=True, is_default=False)

            if all_not_default_address.count() >=1:
                all_not_default_address = all_not_default_address.first()
                all_not_default_address.is_default = True
                all_not_default_address.save()

        return return_message('success', 240)


@user_module.route('/user_comments', methods=['GET'])
@allow_cross_domain
@oauth4api
def user_comment():

    this_user = User.get_one_user(openid=request.headers['userid'])

    all_comment = Comment.objects(user=this_user)

    all_comment_json = []
    for one in all_comment:
        all_comment_json.append({
            'id': str(one.pk),
            'content': one.content,
            'star': one.star,
            'up': one.up,
            'down': one.down,
            'create_time': one.create_time,
            'book': {
                'title': one.book.title,
                'isbn': one.book.isbn,
                'image': one.book.image
            }
        })

    return return_message('success', 201, all_comment_json)


@user_module.route('/user_points', methods=['GET'])
@allow_cross_domain
@oauth4api
def user_points():
    """
    获取用户积分详细
    :return:
    """

    this_user = User.get_one_user(openid=request.headers['userid'])

    all_user_credits = Points.objects(user=this_user).order_by("-time")

    all_user_credits_json = {
        'now_points': 0,
        'count': len(all_user_credits),
        'logs': []
    }

    for one_credits in all_user_credits:
        all_user_credits_json['now_points'] += one_credits.point
        all_user_credits_json['logs'].append({
            'type': one_credits.type,
            'point': one_credits.point,
            'time': one_credits.time,
            'content': one_credits.content
        })

    return return_message('success', 241, all_user_credits_json)


@user_module.route('/user_collects', methods=['GET'])
@allow_cross_domain
@oauth4api
def user_collects():
    type = request.args.get('type', 'book')

    if type not in ['book', 'booklist']:
        return return_message('error', 212)

    this_user = User.get_one_user(openid=request.headers['userid'])

    all_collect = Collect.objects(user=this_user, type=type)

    all_collect_json = []
    for one in all_collect:
        if type == 'book':
            one_book = Book.objects(isbn=one.type_id).first()
            all_collect_json.append({
                'title': one_book.title,
                'isbn': one_book.isbn,
                'image': one_book.image,
                'rate': one_book.rate,
                'reason': one_book.reason
            })
        elif type == 'booklist':
            one_booklist = BookList.objects(pk=one.type_id).first()
            all_collect_json.append({
                'id': str(one_booklist.pk),
                'title': one_booklist.title,
                'collect': one_booklist.collect,
                'image': one_booklist.image,
                'tags': [one_tag.name for one_tag in one_booklist.tag]
            })

    return return_message('success', 242, all_collect_json)


@user_module.route('/user_carts', methods=['GET'])
@allow_cross_domain
@oauth4api
def user_carts():
    this_user = User.get_one_user(openid=request.headers['userid'])
    all_cart = Cart.objects(user=this_user, status=1)
    all_cart_json = []

    for one_cart in all_cart:
        all_cart_json.append({
            'id': str(one_cart.pk),
            'number': one_cart.number,
            'price': float(one_cart.price),
            'book': {
                'isbn': one_cart.book.isbn,
                'title': one_cart.book.title,
                'image': one_cart.book.image,
                'author': [one_author for one_author in one_cart.book.author],
                'is_collection': True if Collect.objects(user=this_user, type='book', type_id=one_cart.book.isbn).count() == 1 else False
            }
        })

    return return_message('success', 243, all_cart_json, data_required=True)


@user_module.route('/user_billings', methods=['GET'])
@allow_cross_domain
@oauth4api
def user_billings():
    """
    返回用户订单
    """
    status = request.args.get('status', None)

    if status not in ['create', 'pending', 'waiting', 'commenting', 'done', 'canceled', 'refund', 'refunding',
                      'refunded', 'replace', 'replacing', 'replaced', 'refunded_refused', 'replace_refunsed',
                      'closed',
                      'return', 'on_return', 'all']:

        return return_message('error', 226)

    this_user = User.get_one_user(openid=request.headers['userid'])
    if status == 'all':
        all_billing = Billing.objects(user=this_user, status__not__in=['close', 'canceled'])
    elif status == 'return':
        all_billing = Billing.objects(user=this_user, status__in=['commenting', 'done'])
    elif status == 'on_return':
        all_billing = Billing.objects(user=this_user, status__in=['refund', 'refunding', 'refunded', 'replace',
                                                                  'replacing', 'replaced',
                                                                  'refund_refused', 'replace_refused'])

    else:
        all_billing = Billing.objects(user=this_user, status=status)

    all_billing_json = []

    for one_billing in all_billing:
        all_billing_json.append({
            'status': one_billing.status,
            'id': str(one_billing.pk),
            'price': float(one_billing.price),
            'carts': [{
                'book': {
                    'isbn': one_cart.book.isbn,
                    'title': one_cart.book.title,
                    'image': one_cart.book.image,
                    'authors': [one_author for one_author in one_cart.book.author]
                },
                'number': one_cart.number,
                'create_time': one_cart.create_time,
                'price': float(one_cart.price),
            } for one_cart in one_billing.list],
            'status_list': [{
                'status': one.status,
                'content': one.content,
                'time': str(one.time),
                'backend': one.backend_operator
                            } for one in one_billing.status_list],
            'create_time': one_billing.create_time,
            'edit_time': one_billing.edit_time
        })

    return return_message('success', 223, all_billing_json)


@user_module.route('/user_notices', methods=['GET', 'POST'])
@allow_cross_domain
@oauth4api
def user_notices():
    """

    :return:
    """
    this_user = User.get_one_user(openid=request.headers['userid'])

    if request.method == 'GET':

        all_user_notices = Notice.objects(user=this_user).order_by("-create_time")

        all_user_notices_json = []

        for one_notice in all_user_notices:
            all_user_notices_json.append({
                'id': str(one_notice.pk),
                'title': one_notice.title,
                'time': one_notice.create_time,
                'content': one_notice.content,
                'url': one_notice.url,
                'is_read': one_notice.is_read
            })

        return return_message('success', 244, all_user_notices_json)

    elif request.method == 'POST':
        pass
        id = request.form.get('id', 0)

        # TODO: 完成NOTICE的阅读

        all_before_notices = Notice.objects(create_time__lte=time, user=this_user, is_read=False)

        for one_notice in all_before_notices:
            one_notice.save()

        return return_message('success', 'read it')


@user_module.route('/user_feedback', methods=['POST'])
@allow_cross_domain
@oauth4api
def user_feedback():

    content = request.form.get('content', None)

    if not content or content == '':
        return return_message('error', 236)

    this_user = User.get_one_user(openid=request.headers['userid'])

    Feedback(
        content=content,
        user=this_user
    ).save()

    return return_message('success', 245)
