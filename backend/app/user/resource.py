# -*- coding: utf-8 -*-
from flask_restful import Resource, reqparse, abort
from app.lib.restful import authenticate, base_parse, phone, valid_object_id, valid_book
from app.lib.restful import abort_valid_in_list, abort_invalid_isbn, get_from_object_id
from app.auth.model import User, UserInlineCart
from app.book.model import Tag, BookList, Activity, Book, BookTag
from app.user.model import Comment, Points, UserCommentLove, Collect, Billing, Notice, Cart, Feedback, BillingStatus, \
    UserBookListLove, BookListComment, UserBookListCommentLove, UserAddress, NewBilling, NewCart, InlineAddress

from time import time


class BookListLoveResource(Resource):
    # /rest/booklist/<>/love
    """
    书单点赞
    """
    method_decorators = [authenticate]

    def post(self, book_list_id):
        """
        点赞或者取消
        :return:
        """
        book_list = get_from_object_id(book_list_id, BookList, 'book_list_id')
        user = User.get_user_on_headers()

        is_love = UserBookListLove.objects(book_list=book_list, user=user)
        if is_love.count() == 0:
            UserBookListLove(book_list=book_list, user=user).save()
            return {
                'id': book_list_id,
                'love': True,
            }
        else:
            for one in is_love:
                one.delete()
            return {
                'id': book_list_id,
                'love': False,
            }


class BookCommentsResource(Resource):
    # /rest/book/<>/comments
    """
    单本书籍的评论
    """
    method_decorators = [authenticate]

    get_parser = reqparse.RequestParser()
    get_parser.add_argument('page', type=int, default=1)
    get_parser.add_argument('per_page', type=int, default=5)

    def get(self, isbn):
        """
        读取一本书的所有评论
        :param isbn:
        :return:
        """
        args = self.get_parser.parse_args()
        book = abort_invalid_isbn(isbn)
        comments = Comment.objects(book=book).order_by("create_time").limit(args['per_page']).skip(args['per_page']*(args['page']-1))
        user = User.get_user_on_headers()
        comments_json = []

        for comment in comments:
            up_already = True if UserCommentLove.objects(user=user, comment=comment,
                                                         type='up').count() == 1 else False
            down_already = True if UserCommentLove.objects(user=user, comment=comment,
                                                           type='down').count() == 1 else False
            comments_json.append({
                'id': str(comment.pk),
                'content': comment.content,
                'star': comment.star,
                'up': comment.up,
                'down': comment.down,
                'up_already': up_already,
                'down_already': down_already,
                'user': {
                    'avatar': comment.user.avatar,
                    'username': comment.user.username
                },
                'create_time': comment.create_time
            })

    post_parser = reqparse.RequestParser()
    post_parser.add_argument('content', type=unicode, required=True, help='MISSING_CONTENT')
    post_parser.add_argument('star', type=int, default=0)

    def post(self, isbn):
        """
        发布一本书的评论
        :param isbn:
        :return:
        """
        args = self.post_parser.parse_args()
        args['star'] = max(args['star'], 0)
        args['star'] = min(args['star'], 10)

        book = abort_invalid_isbn(isbn)
        user = User.get_user_on_headers()

        comment = Comment(
            content=args['content'],
            star=args['star'],
            book=book,
            user=user
        ).save()

        Points.add_record(
            user=user,
            record_type=Points.PointType.COMMENT,
        )
        comment_json = {
            'id': str(comment.pk),
            'content': comment.content,
            'star': comment.star,
            'up': comment.up,
            'up_already': False,
            'down': comment.down,
            'down_already': False,
            'create_time': comment.create_time
        }

        return comment_json


class BookCommentResource(Resource):
    # /rest/comments/<>
    method_decorators = [authenticate]

    put_parser = reqparse.RequestParser()
    put_parser.add_argument('content', type=unicode, required=True, help='MISSING_CONTENT')
    put_parser.add_argument('star', type=int, default=0)

    def put(self, comment_id):
        """
        修改评论
        :param comment_id:
        :return:
        """
        args = self.put_parser.parse_args()
        args['star'] = max(args['star'], 0)
        args['star'] = min(args['star'], 10)

        comment = get_from_object_id(comment_id, Comment, 'comment_id')

        comment.update(**args)
        comment.edit_time = int(time())
        comment.save()

        return {
            'id': str(comment.pk),
            'content': comment.content,
            'star': comment.star,
            'create_time': comment.create_time,
            'edit_time': comment.edit_time
        }

    patch_parser = reqparse.RequestParser()
    patch_parser.add_argument('type', type=str, required=True, default='up')

    def patch(self, comment_id):
        """
        评论 up/down
        :param comment_id:
        :return:
        """
        args = self.patch_parser.parse_args()
        abort_valid_in_list('type', args['type'], ['up', 'down', 'none'])
        comment = get_from_object_id(comment_id, Comment, 'comment_id', verify_owner=False)
        user = User.get_user_on_headers()
        love = UserCommentLove.objects(user=user, comment=comment)
        if love.count() == 1:
            love = love.first()
            love.type = args['type']
            love.save()
        else:
            love = UserCommentLove(user=user, comment=comment, type=args['type']).save()

        if love.type == 'none':
            love.delete()

        return {
            'love': args['type']
        }

    def delete(self, comment_id):
        """
        删除评论
        :param comment_id:
        :return:
        """
        comment = get_from_object_id(comment_id, Comment, 'comment_id')
        user_comment_loves = UserCommentLove.objects(comment=comment)
        for one_love in user_comment_loves:
            one_love.delete()
        comment.delete()


class BookListCommentsResource(Resource):
    # /rest/booklist/<>/comments
    method_decorators = [authenticate]

    get_parser = reqparse.RequestParser()
    get_parser.add_argument('page', type=int, default=1)
    get_parser.add_argument('per_page', type=int, default=5)

    def get(self, book_list_id):
        """
        读取书单的所有评论
        :param book_list_id:
        :return:
        """
        args = self.get_parser.parse_args()
        book_list = get_from_object_id(book_list_id, BookList, 'book_list')

        user = User.get_user_on_headers()
        comments = BookListComment.objects(book_list=book_list)\
            .order_by("create_time")\
            .limit(args['per_page']).skip(args['per_page'] * (args['page'] - 1))

        comments_json = []

        for comment in comments:
            up_already = True if UserBookListCommentLove.objects(user=user, comment=comment,
                                                                 type='up').count() == 1 else False
            down_already = True if UserBookListCommentLove.objects(user=user, comment=comment,
                                                                   type='down').count() == 1 else False
            comments_json.append({
                'id': str(comment.pk),
                'content': comment.content,
                'star': comment.star,
                'up': comment.up,
                'down': comment.down,
                'up_already': up_already,
                'down_already': down_already,
                'user': {
                    'avatar': comment.user.avatar,
                    'username': comment.user.username
                },
                'create_time': comment.create_time
            })

    post_parser = reqparse.RequestParser()
    post_parser.add_argument('content', type=unicode, required=True, help='MISSING_CONTENT')
    post_parser.add_argument('star', type=int, default=0)

    def post(self, book_list_id):
        """
        发布书单评论
        :param book_list_id:
        :return:
        """
        args = self.post_parser.parse_args()
        args['star'] = max(args['star'], 0)
        args['star'] = min(args['star'], 10)

        book_list = get_from_object_id(book_list_id, BookList, 'book_list_id')
        user = User.get_user_on_headers()

        comment = BookListComment(
            content=args['content'],
            star=args['star'],
            book_list=book_list,
            user=user
        ).save()

        comment_json = {
            'id': str(comment.pk),
            'content': comment.content,
            'star': comment.star,
            'up': comment.up,
            'up_already': False,
            'down': comment.down,
            'down_already': False,
            'create_time': comment.create_time
        }

        return comment_json


class BookListCommentResource(Resource):
    # /rest/booklistcomment/<>
    method_decorators = [authenticate]

    put_parser = reqparse.RequestParser()
    put_parser.add_argument('content', type=unicode, required=True, help='MISSING_CONTENT')
    put_parser.add_argument('star', type=int, default=0)

    def put(self, comment_id):
        """
        修改评论
        :param comment_id:
        :return:
        """
        args = self.put_parser.parse_args()
        args['star'] = max(args['star'], 0)
        args['star'] = min(args['star'], 10)

        comment = get_from_object_id(comment_id, BookListComment, 'comment_id')

        comment.update(**args)
        comment.edit_time = int(time())
        comment.save()

        return {
            'id': str(comment.pk),
            'content': comment.content,
            'star': comment.star,
            'create_time': comment.create_time,
            'edit_time': comment.edit_time
        }

    patch_parser = reqparse.RequestParser()
    patch_parser.add_argument('type', type=str, required=True, default='up')

    def patch(self, comment_id):
        """
        评论 up/down
        :param comment_id:
        :return:
        """
        args = self.patch_parser.parse_args()
        abort_valid_in_list('type', args['type'], ['up', 'down', 'none'])
        comment = get_from_object_id(comment_id, BookListComment, 'comment_id', verify_owner=False)
        user = User.get_user_on_headers()
        love = UserBookListCommentLove.objects(user=user, comment=comment)
        if love.count() == 1:
            love = love.first()
            love.type = args['type']
            love.save()
        else:
            love = UserBookListCommentLove(user=user, comment=comment, type=args['type']).save()

        if love.type == 'none':
            love.delete()

        return {
            'love': args['type']
        }
    def delete(self, comment_id):
        """
        删除评论
        :param comment_id:
        :return:
        """
        comment = get_from_object_id(comment_id, BookListComment, 'comment_id')
        user_comment_loves = UserBookListCommentLove.objects(comment=comment)
        for one_love in user_comment_loves:
            one_love.delete()
        comment.delete()


class BookCollectResource(Resource):
    # /rest/book/<>/collect
    """
    书籍收藏
    """
    def post(self, isbn):
        """
        收藏
        :return:
        """
        book = abort_invalid_isbn(isbn)
        user = User.get_user_on_headers()
        collect = Collect.objects(user=user, type='book', type_id=str(book.isbn))
        if collect.count() == 0:
            Collect(user=user, type='book', type_id=str(book.isbn)).save()

        return {
            'collect': True,
        }

    def delete(self, isbn):
        """
        删除收藏
        :return:
        """
        book = abort_invalid_isbn(isbn)
        user = User.get_user_on_headers()
        collect = Collect.objects(user=user, type='book', type_id=str(book.isbn))
        if collect.count() == 1:
            collect = collect.first()
            collect.delete()

        return {
            'collect': False,
        }


class BookListCollectResource(Resource):
    # /rest/booklist/<>/collect
    """
    书单收藏
    """

    def post(self, book_list_id):
        """
        收藏
        :return:
        """
        book_list = get_from_object_id(book_list_id, BookList, 'book_list_id')
        user = User.get_user_on_headers()
        collect = Collect.objects(user=user, type='booklist', type_id=str(book_list.pk))
        if collect.count() == 0:
            Collect(user=user, type='booklist', type_id=str(book_list.pk)).save()
        return {
            'book_list_collect': True,
        }

    def delete(self, book_list_id):
        """
        删除收藏
        :return:
        """
        book_list = get_from_object_id(book_list_id, BookList, 'book_list_id')
        user = User.get_user_on_headers()
        collect = Collect.objects(user=user, type='booklist', type_id=str(book_list.pk))
        if collect.count() == 1:
            collect = collect.first()
            collect.delete()

        return {
            'book_list_collect': False,
        }


class CartsResource(Resource):
    # /rest/carts
    """
    购物车
    """
    method_decorators = [authenticate]

    def get(self):
        """
        查看用户所有购物车
        :return:
        """
        user = User.get_user_on_headers()
        carts_json = []
        for cart in user.carts:
            book = Book.objects(isbn=cart.book_isbn).first()
            carts_json.append({
                'number': cart.number,
                'per_price': float(book.price),
                'price': float(book.price) * cart.number,
                'book': {
                    'isbn': book.isbn,
                    'title': book.title,
                    'image': book.image.get_full_url(),
                    'author': [one_author for one_author in book.author],
                    'is_collection': True if Collect.objects(user=user, type='book',
                                                             type_id=book.isbn).count() == 1 else False
                }
            })
        return carts_json

    post_parser = reqparse.RequestParser()
    post_parser.add_argument('isbn', type=valid_book, dest='book', required=True,
                             help='MISSING_OR_WRONG_ISBN')
    post_parser.add_argument('number', type=int, default=1)

    def post(self):
        """
        提交一个新的购物车
        :return:
        """
        args = self.post_parser.parse_args()

        isbn = args['book'].isbn
        user = User.get_user_on_headers()

        cart = user.carts.filter(book_isbn=isbn)

        cart_json = {
            'isbn': isbn
        }
        cart = list(cart)
        cart = cart[0] if len(cart)>0 else None

        user.add_cart(isbn, args['number'])
        number = args['number']
        if cart:
            number += cart.number

        if number <= 0:
            number = 0

        cart_json['number'] = number
        return cart_json

    delete_parser = reqparse.RequestParser()
    delete_parser.add_argument('isbn', type=valid_book, dest='book', required=True, action='append',
                               help='MISSING_OR_WRONG_ISBN')

    def delete(self):
        """
        删除购物车
        :return:
        """
        args = self.delete_parser.parse_args()
        isbns = [book.isbn for book in args['book']]
        user = User.get_user_on_headers()
        carts = list(user.carts)
        for cart in carts:
            if cart.book_isbn in isbns:
                carts.remove(cart)

        user.carts = carts
        user.carts.save()
        user.save()


class BillingsResource(Resource):
    # /rest/billings
    """
    订单
    """
    method_decorators = [authenticate]

    get_parser = reqparse.RequestParser()
    get_parser.add_argument('status', type=str, default='all')

    def get(self):
        """
        查看用户所有订单
        :return:
        """
        args = self.get_parser.parse_args()

        abort_valid_in_list('status', args['status'], [
            'create', 'pending', 'waiting', 'commenting', 'done', 'canceled', 'refund', 'refunding',
            'refunded', 'replace', 'replacing', 'replaced', 'refunded_refused', 'replace_refunsed',
            'closed',
            'return', 'on_return', 'all'
        ])
        status = args['status']
        user = User.get_user_on_headers()

        if status == 'all':
            billing = NewBilling.objects(user=user, status__not__in=['close', 'canceled'])
        elif status == 'return':
            billing = NewBilling.objects(user=user, status__in=['commenting', 'done'])
        elif status == 'on_return':
            billing = NewBilling.objects(user=user, status__in=['refund', 'refunding', 'refunded',
                                                                 'replace', 'replacing', 'replaced',
                                                                 'refund_refused', 'replace_refused'])

        else:
            billing = NewBilling.objects(user=user, status=status)

        billings_json = []

        for billing in billing:
            billings_json.append({
                'status': billing.status,
                'id': str(billing.pk),
                'price': float(billing.get_sum_price()),
                'carts': [{
                              'book': {
                                  'isbn': one_cart.book.isbn,
                                  'title': one_cart.book.title,
                                  'image': one_cart.book.image.get_full_url(),
                                  'authors': [one_author for one_author in one_cart.book.author]
                              },
                              'create_time': one_cart.create_time,
                              'per_price': float(one_cart.price),
                              'number': number,
                              'price_sum': float(one_cart.price) * number
                          } for one_cart, number in billing.carts_info()],
                'status_list': [{
                                    'status': one.status,
                                    'content': one.content,
                                    'time': str(one.time),
                                    'backend': one.backend_operator
                                } for one in billing.status_list],
                'create_time': billing.create_time,
                'edit_time': billing.edit_time
            })

        return billings_json

    post_parser = reqparse.RequestParser()
    post_parser.add_argument('cart', type=valid_book, required=True, action='append', help='MISSING_OR_WRONG_ISBN')
    post_parser.add_argument('number', type=int, required=True, action='append', help='MISSING_OR_WRONG_NUMBER')
    post_parser.add_argument('address', type=valid_object_id, required=True, help='MISSING_OR_WRONG_ADDRESS_ID')

    def post(self):
        """
        提交一个订单
        :return:
        """
        args = self.post_parser.parse_args()
        if len(args['cart']) != len(args['number']):
            abort(400, message='MISSING_ISBN_OR_NUMBER')

        address = get_from_object_id(args['address'], UserAddress, 'address_id', enabled=True)
        user = User.get_user_on_headers()
        carts = []
        for l_id, book in enumerate(args['cart']):
            user.add_cart(book.isbn, args['number'][l_id])
            for loop in range(args['number'][l_id]):
                cart = NewCart(
                    book=book,
                    price=float(book.price),
                ).save()
                carts.append(cart)

        billing = NewBilling(
            user=user,
            status='pending',
            carts=carts,
            address=InlineAddress(
                name=address.name,
                phone=address.phone,
                dormitory=address.dormitory
            ),
            status_list=[BillingStatus(
                status='create',
                content=u'创建订单'
            ), BillingStatus(
                status='pending',
                content=u'待发货'
            )]
        ).save()

        billing_json = {
            'id': str(billing.pk),
            'price': float(billing.get_sum_price()),
            'status': billing.status
        }
        return billing_json


class BillingResource(Resource):
    # /rest/billing/<>
    """
    单个订单
    """
    method_decorators = [authenticate]

    def get(self, billing_id):
        """
        查看单个订单信息
        :param billing_id:
        :return:
        """
        billing = get_from_object_id(billing_id, NewBilling, 'billing_id')
        billing_json = {
            'id': str(billing.pk),
            'status': billing.status,
            'status_list': [{
                                'status': one.status,
                                'content': one.content,
                                'time': str(one.time),
                                'backend': one.backend_operator
                            } for one in billing.status_list],
            'carts': [{
                              'book': {
                                  'isbn': one_cart.book.isbn,
                                  'title': one_cart.book.title,
                                  'image': one_cart.book.image.get_full_url(),
                                  'authors': [one_author for one_author in one_cart.book.author]
                              },
                              'create_time': one_cart.create_time,
                              'per_price': float(one_cart.price),
                              'number': number,
                              'price_sum': float(one_cart.price) * number
                          } for one_cart, number in billing.carts_info()],
            'address': {
                'name': billing.address.name,
                'phone': billing.address.phone,
                'dormitory': billing.address.dormitory
            },
            'price': float(billing.get_sum_price())
        }

        return billing_json

    put_parser = reqparse.RequestParser()
    put_parser.add_argument('status', type=str, required=True, help='MISSING_OR_WRONG_STATUS')

    def put(self, billing_id):
        """
        修改一个订单
        :return:
        """
        args = self.put_parser.parse_args()
        abort_valid_in_list('status', args['status'], ['waiting', 'commenting', 'done', 'refund'])

        billing = get_from_object_id(billing_id, NewBilling, 'billing_id')

        try:
            billing.change_status(args['status'])
        except Exception:
            abort(400, message='BILLING_ERROR_OPERATOR')

        return {
            'id': str(billing.pk),
            'status': billing.status
        }

    def delete(self, billing_id):
        """
        删除一个订单
        :return:
        """
        billing = get_from_object_id(billing_id, NewBilling, 'billing_id')

        try:
            billing.change_status('canceled')
        except Exception:
            abort(400, message='BILLING_ERROR_OPERATOR')


class UserResource(Resource):
    # /rest/user
    """
    用户信息
    """
    method_decorators = [authenticate]

    def get(self):
        """
        读取用户信息
        :return:
        """
        user = User.get_user_on_headers()
        user_json = {
            'username': user.username,
            'avatar': user.avatar or '',
            'sex': user.sex,
            'unread_notice': Notice.objects(user=user, is_read=False).count(),
            'cart_num': Cart.objects(user=user, status=1).count(),
            'billing_pending_num': Billing.objects(user=user, status='pending').count(),
            'billing_commenting_num': Billing.objects(user=user, status='commenting').count()
        }

        return user_json


class UserAddressListResource(Resource):
    # /rest/user/addresses
    """
    所有用户地址
    """
    method_decorators = [authenticate]

    get_parser = reqparse.RequestParser()
    get_parser.add_argument('type', type=str, default='all')

    def get(self):
        """
        读取用户地址
        :return:
        """
        args = self.get_parser.parse_args()
        abort_valid_in_list('TYPE', args['type'], ['all', 'default'])
        user = User.get_user_on_headers()

        addresses = UserAddress.objects(user=user, enabled=True)
        if args['type'] == 'default':
            addresses_f = addresses.filter(is_default=True)
            if addresses_f.count() == 1:
                addresses = [addresses_f.first()]
            else:
                addresses = [addresses.first()]

        addresses_json = []
        for address in addresses:
            if isinstance(address, UserAddress):
                addresses_json.append({
                    'id': str(address.pk),
                    'name': address.name,
                    'phone': address.phone,
                    'dormitory': address.dormitory,
                    'is_default': address.is_default
                })

        return addresses_json

    post_parser = reqparse.RequestParser()
    post_parser.add_argument('name', type=unicode, required=True, location='form', help='MISSING_NAME')
    post_parser.add_argument('phone', type=phone, required=True, location='form', help='MISSING_OR_WRONG_PHONE')
    post_parser.add_argument('dormitory', type=unicode, required=True, location='form', help='MISSING_DORMITORY')
    post_parser.add_argument('type', type=str, location='form', default='normal')

    def post(self):
        """
        新建用户地址
        :return:
        """
        args = self.post_parser.parse_args()
        abort_valid_in_list('TYPE', args['type'], ['normal', 'default'])

        user = User.get_user_on_headers()
        default_address = UserAddress.objects(user=user, enabled=True, is_default=True)
        default_address = default_address.first() if default_address.count() == 1 else None

        if not default_address:
            # 不存在默认地址
            user_address = UserAddress(
                name=args['name'],
                phone=str(args['phone']),
                dormitory=args['dormitory'],
                user=user,
                is_default=True
            ).save()
        else:
            if args['type'] == 'default':
                default_address.is_default = False
                default_address.save()

                user_address = UserAddress(
                    name=args['name'],
                    phone=str(args['phone']),
                    dormitory=args['dormitory'],
                    user=user,
                    is_default=True
                ).save()
            else:
                user_address = UserAddress(
                    name=args['name'],
                    phone=str(args['phone']),
                    dormitory=args['dormitory'],
                    user=user,
                ).save()

        return {
            'name': user_address.name,
            'phone': user_address.phone,
            'dormitory': user_address.dormitory,
            'is_default': user_address.is_default
        }


class UserAddressResource(Resource):
    # /rest/user/addresses/<>
    """
    用户地址
    """
    method_decorators = [authenticate]

    put_parser = reqparse.RequestParser()
    put_parser.add_argument('name', type=unicode, location='form')
    put_parser.add_argument('phone', type=phone, location='form')
    put_parser.add_argument('dormitory', type=unicode, location='form')
    put_parser.add_argument('type', type=str, location='form')

    def put(self, address_id):
        """
        修改用户地址
        :param address_id:
        :return:
        """
        args = self.put_parser.parse_args()
        abort_valid_in_list('TYPE', args['type'], [None, 'normal', 'default'])

        address = get_from_object_id(address_id, UserAddress, 'address_id', enabled=True)
        for key, value in args.items():
            if value and key != 'type':
                address[key] = value

        if args['type'] == 'default':
            address.is_default = True
            user = User.get_user_on_headers()
            default_addresses = UserAddress.objects(user=user, enabled=True, is_default=True)
            for one in default_addresses:
                one.is_default = False
                one.save()
        address.save()

        return {
            'name': address.name,
            'phone': address.phone,
            'dormitory': address.dormitory,
            'is_default': address.is_default
        }

    def delete(self, address_id):
        """
        删除用户地址
        :param address_id:
        :return:
        """
        address = get_from_object_id(address_id, UserAddress, 'Address_id', enabled=True)

        if address.is_default:
            user = User.get_user_on_headers()
            not_default_address = UserAddress.objects(user=user, enabled=True, is_default=False).first()
            if not_default_address:
                not_default_address.is_default = True
                not_default_address.save()
        address.is_default = False
        address.enabled = False
        address.save()


class UserCommentsResource(Resource):
    # /rest/user/comments
    """
    用户所有评论
    """
    method_decorators = [authenticate]

    def get(self):
        """
        返回用户所有评论
        :return:
        """
        user = User.get_user_on_headers()
        comments = Comment.objects(user=user)

        comments_json = []
        for one in comments:
            comments_json.append({
                'id': str(one.pk),
                'content': one.content,
                'star': one.star,
                'up': one.up,
                'down': one.down,
                'create_time': one.create_time,
                'book': {
                    'title': one.book.title,
                    'isbn': one.book.isbn,
                    'image': one.book.image.get_full_url()
                }
            })

        return comments_json


class UserPointsResource(Resource):
    # /rest/user/points
    """
    用户积分
    """
    method_decorators = [authenticate]

    def get(self):
        """
        返回用户所有积分
        :return:
        """
        user = User.get_user_on_headers()
        points = Points.objects(user=user).order_by("-time")
        points_json = {
            'now_points': 0,
            'count': len(points),
            'logs': []
        }

        for point in points:
            points_json['now_points'] += point.point
            points_json['logs'].append({
                'type': point.type,
                'point': point.point,
                'time': point.time,
                'content': point.content
            })

        return points_json


class UserCollectsResource(Resource):
    # /rest/user/collects/<collect_type>
    """
    用户收藏
    """
    method_decorators = [authenticate]

    def get(self, collect_type):
        """
        返回对应类型的用户所有收藏
        :param collect_type:
        :return:
        """
        abort_valid_in_list('Collect_type', collect_type, ['book', 'booklist'])

        if collect_type == 'book':
            return self.book_collects()
        elif collect_type == 'booklist':
            return self.book_list_collects()

    @staticmethod
    def book_collects():
        user = User.get_user_on_headers()
        collects = Collect.objects(user=user, type='book')

        collects_json = []

        for collect in collects:
            book = Book.objects(isbn=collect.type_id)
            if book.count() == 1:
                book = book.first()
                collects_json.append({
                    'title': book.title,
                    'isbn': book.isbn,
                    'image': book.image.get_full_url(),
                    'rate': book.rate,
                    'reason': book.reason
                })
        return collects_json

    @staticmethod
    def book_list_collects():
        user = User.get_user_on_headers()
        collects = Collect.objects(user=user, type='booklist')

        collects_json = []

        for collect in collects:
            book_list = BookList.objects(pk=collect.type_id)
            if book_list.count() == 1:
                book_list = book_list.first()
                collects_json.append({
                    'id': str(book_list.pk),
                    'title': book_list.title,
                    'collect': book_list.collect,
                    'image': book_list.image.get_full_url(),
                    'tags': [one_tag.name for one_tag in book_list.tag]
                })
        return collects_json


class UserNoticesResource(Resource):
    # /rest/user/notices
    """
    用户信息
    """
    method_decorators = [authenticate]

    def get(self):
        """
        读取用户所有信息
        :return:
        """
        user = User.get_user_on_headers()
        notices = Notice.objects(user=user).order_by("-create_time")
        notices_json = []

        for notice in notices:
            notices_json.append({
                'id': str(notice.pk),
                'title': notice.title,
                'time': notice.create_time,
                'content': notice.content,
                'url': notice.url,
                'is_read': notice.is_read
            })

        return notices_json


class UserNoticeResource(Resource):
    # /rest/user/notices/<>
    """
    用户信息
    """
    method_decorators = [authenticate]

    def get(self, notice_id):
        """
        读取用户单条信息
        :return:
        """
        notice = get_from_object_id(notice_id, Notice, 'notice_id')

        notice_json = {
            'id': str(notice.pk),
            'title': notice.title,
            'time': notice.create_time,
            'content': notice.content,
            'url': notice.url,
            'is_read': notice.is_read
        }

        return notice_json

    def put(self, notice_id):
        """
        通知的阅读
        :param notice_id:
        :return:
        """
        notice = get_from_object_id(notice_id, Notice, 'notice_id')
        notice.read()

        return {
            'id': str(notice.pk),
            'read_time': notice.read_time
        }


class FeedbackResource(Resource):
    # /rest/feedback
    """
    反馈
    """
    method_decorators = [authenticate]

    post_parser = reqparse.RequestParser()
    post_parser.add_argument('content', type=unicode, required=True, help='MISSING_CONTENT', location='form')

    def post(self):
        """
        发布一个反馈
        :return:
        """
        args = self.post_parser.parse_args()
        user = User.get_user_on_headers()

        feedback = Feedback(
            content=args['content'],
            user=user
        ).save()

        return {
            'content': args['content'],
            'time': feedback.time
        }
