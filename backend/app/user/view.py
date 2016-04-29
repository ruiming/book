# -*- coding: utf-8 -*-

from flask import Blueprint, jsonify, request

from app.auth.model import User
from app.book.model import Book, BookList
from app.user.model import Comment, Points, UserCommentLove, Collect, Order

from app.lib.common_function import return_message, token_verify
from app.lib.api_function import allow_cross_domain

from datetime import datetime


user_module = Blueprint('user_module', __name__)


@user_module.route('/comments', methods=['GET'])
@allow_cross_domain
def comments():
    """
    返回书籍所有评论
    """
    isbn = request.args.get('isbn', None)
    token = request.args.get('token', None)

    this_book = Book.objects(isbn=isbn)
    this_book = this_book.first() if this_book.count() == 1 else None
    if this_book is None:
        return return_message('error', 'book do not exist')

    all_comment = Comment.objects(book=this_book).order_by("-create_time")

    all_comment_json = []

    for one in all_comment:
        all_comment_json.append({
            'id': str(one.pk),
            'content': one.content,
            'star': one.star,
            'up': one.up,
            'down': one.down,
            'user': {
                'avatar': one.user.avatar,
                'username': one.user.username
            }
        })

    return return_message('success', all_comment_json)


@user_module.route('/comment', methods=['POST', 'PUT'])
@allow_cross_domain
def comment():
    """
    发布评论
    """
    if request.method == 'POST':
        token = request.form.get('token', None)
        isbn = request.form.get('isbn', None)
        content = request.form.get('content', None)
        star = request.form.get('star', None)
        # TODO: star的max值
        star = int(star) if star is not None else None

        if isbn is None or content is None or star is None:
            return return_message('error', 'missing comment data')

        this_book = Book.objects(isbn=isbn)
        this_book = this_book.first() if this_book.count() == 1 else None

        if this_book is None:
            return return_message('error', 'book do not exist')

        this_user = User.objects(token=token)
        this_user = this_user.first() if this_user.count() == 1 else None

        if this_user is None:
            return return_message('error', 'user do not exist')

        this_comment = Comment(
            content=content,
            star=star,
            book=this_book,
            user=this_user

        ).save()
        return return_message('success', 'submit successfully')

    elif request.method == 'PUT':
        """
        提交评论点赞/ 修改评论
        """

        id = request.form.get('id', None)
        token = request.form.get('token', None)
        type = request.form.get('type', 'up')

        if id is not None:
            if len(id) != 24:
                id = None

        if type not in ['up', 'down']:
            return return_message('error', 'unknown type')

        if id is None:
            return return_message('error', 'unknown comment')
        else:
            this_comment = Comment.objects(_id=id)
            if this_comment.count() != 1:
                return return_message('error', 'unknown comment')
            else:
                this_comment = this_comment.first()

        this_user = User.objects(token=token).first()

        this_user_comment_love = UserCommentLove.objects(user=this_user, commentid=str(this_comment._id))

        if this_user_comment_love.count() == 1:
            # 存在记录
            this_user_comment_love = this_user_comment_love.first()

            this_comment[this_user_comment_love.type] -= 1
            this_user_comment_love.type = type

            this_comment[type] += 1
            this_comment.save()
            this_user_comment_love.save()
        else:
            UserCommentLove(
                user=this_user,
                commentid=str(this_comment.pk),
                type=type
            ).save()
            this_comment[type] += 1
            this_comment.save()

        return return_message('success', 'submit success')


@user_module.route('/collect', methods=['POST', 'DELETE'])
@allow_cross_domain
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

        token = request.form.get('token', None)
        type = request.form.get('type', None)
        id = request.form.get('id', None)

        if type not in ['book', 'booklist']:
            return return_message('error', 'unknown type')

        if id == '' or not istance_objects(type, id):
            return return_message('error', 'missing id')

        this_user = User.objects(token=token)
        this_user = this_user.first() if this_user.count() == 1 else None

        if this_user is None:
            return return_message('error', 'user do not exist')

        is_inserted = Collect.objects(user=this_user, type=type, type_id=id).count()

        if is_inserted == 0:
            Collect(user=this_user, type=type, type_id=id).save()
            if type == 'booklist':
                this_booklist = BookList.objects(_id=id).first()
                this_booklist.collect += 1
                this_booklist.save()
            return return_message('success', 'submit successfully')
        elif is_inserted == 1:
            return return_message('success', 'collect already exist')
        else:
            # logger
            return return_message('error', 'unknown error')


    elif request.method == 'DELETE':
        """
        删除收藏信息
        """
        token = request.form.get('token', None)
        id = request.form.get('id', None)

        if len(id) != 24:
            return return_message('error', 'unknown id')

        this_user = User.objects(token=token)
        this_user = this_user.first() if this_user.count() == 1 else None

        if this_user is None:
            return return_message('error', 'user do not exist')

        is_inserted = Collect.objects(_id=id).count()

        if is_inserted == 0:
            return return_message('success', 'submit successfully')
        elif is_inserted == 1:
            this_collect = Collect.objects(_id=id).first()
            if this_collect.type == 'booklist':
                this_booklist = BookList.objects(_id=id).first()
                this_booklist.collect -= 1
                this_booklist.save()
            Collect.objects(_id=id).delete()

            return return_message('success', 'submit successfully')
        else:
            # logger
            return return_message('error', 'unknown error')


@user_module.route('/order', methods=['GET', 'POST'])
@allow_cross_domain
def order():
    if request.method == 'GET':
        """
        查看一个订单状态
        """
        token = request.args.get('token', None)
        this_user = User.objects(token=token).first()

        isbn = request.args.get('isbn', None)
        # TODO: 改为用id查询订单信息
        if isbn is None or Book.objects(isbn=isbn).count() != 1:
            return return_message('error', 'unknown book isbn')

        this_book = Book.objects(isbn=isbn).first()
        this_book_order = Order.objects(user=this_user, book=this_book)

        if this_book_order.count() != 1:
            # 查不到订单
            return return_message('succss', {
                'order': {
                    'status': 'none'
                }
            })
        else:
            # 返回订单信息
            this_book_order = this_book_order.first()
            return return_message('success', {
                'order': {
                    'status': this_book_order.status,
                    'book': {
                        'title': this_book_order.book.title
                        # 书本信息补全
                    },
                    'price': this_book_order.price,
                    'create_time': this_book_order.create_time
                }
            })

    elif request.method == 'POST':
        """
        提交/修改一个订单
        """
        token = request.form.get('token', None)
        isbn = request.form.get('isbn', None)

        status = request.form.get('status', None)

        if isbn is None or Book.objects(isbn=isbn).count() != 1:
            return return_message('error', 'unknown book isbn')

        if status not in ['none', 'pending', 'cart', 'done']:
            return return_message('error', 'unknown status')

        this_user = User.objects(token=token).first()
        this_book = Book.objects(isbn=isbn).first()

        this_order = Order.objects(user=this_user, book=this_book)
        this_order = None if this_order.count() != 1 else this_order.first()

        if this_order is None:
            if status != 'none':
                Order(
                    user=this_user,
                    book=this_book,
                    status=status,
                    price=this_book.price
                    # TODO: 重新获取当当书籍的价格
                ).save()

        else:

            if status == 'none':
                this_order.delete()
            else:
                this_order.status = status
                this_order.price = this_book.price
                # TODO: 重新获取当当价格
                this_order.edit_time = datetime.now()
                this_order.save()

        return return_message('success', 'submit successfully')


@user_module.route('/user_comments', methods=['GET'])
@allow_cross_domain
def user_comment():

    pass
    token = request.args.get('token', None)
    this_user = token_verify(token)

    if this_user is None:
        return return_message('error', 'user verify failure')

    all_comment = Comment.objects(user=this_user)

    all_comment_json = []
    for one in all_comment:
        all_comment_json.append({
            'id': str(one._id),
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

    return return_message('success', all_comment_json)


@user_module.route('/user_points', methods=['GET'])
@allow_cross_domain
def user_points():
    """
    获取用户积分详细
    :return:
    """

    token = request.args.get('token', None)
    this_user = token_verify(token)

    if this_user is None:
        return return_message('error', 'user verify fail')

    all_user_credits = Points.objects(user=this_user)

    all_user_credits_json = {
        'now_credits': this_user.credits,
        'count': len(all_user_credits),
        'logs': []
    }

    for one_credits in all_user_credits:
        all_user_credits_json['list'].append({
            'type': one_credits.type,
            'point': one_credits.point,
            'time': one_credits.time,
            'content': one_credits.content
        })

    return return_message('success', all_user_credits_json)


@user_module.route('/user_collects', methods=['GET'])
@allow_cross_domain
def user_collects():
    pass
    token = request.args.get('token', None)
    type = request.args.get('type', 'book')

    if type not in ['book', 'booklist']:
        return return_message('error', 'unknown type')

    this_user = token_verify(token)

    if this_user is None:
        return return_message('error', 'user verify failure')

    all_collect = Collect.objects(user=this_user, type=type)

    all_collect_json = []
    for one in all_collect:
        if type == 'book':
            one_book = Book.objects(isbn=one.type_id).first()
            # TODO: 收藏API 书本信息补全
            all_collect_json.append({
                'title': one_book.title,
                'isbn': one_book.isbn
            })
        elif type == 'booklist':
            one_booklist = BookList.objects(_id=one.type_id).first()
            # todo: 收藏API 书单信息补全
            all_collect_json.append({
                'title': one_booklist.title,
                'description': one_booklist.description
            })

    return return_message('success', all_collect_json)


@user_module.route('/user_orders', methods=['GET'])
@allow_cross_domain
def user_orders():
    token = request.args.get('token', None)
    status = request.args.get('status', None)

    if status not in ['all', 'pending', 'cart', 'done']:
        return return_message('error', 'unknown order status')

    this_user = User.objects(token=token).first()

    if status == 'all':
        all_order = Order.objects(user=this_user)
    else:
        all_order = Order.objects(user=this_user, status=status)

    all_order_json=[]
    for one_order in all_order:
        all_order_json.append({
            'status': one_order.status,
            'price': one_order.price,
            'book': {
                'title': one_order.book.title,
                'isbn': one_order.book.isbn,
                # TODO: 补全书籍信息
                'author': [one_author for one_author in one_order.book.author]
            },
            'create_time': one_order.create_time,
            'edit_time': one_order.edit_time
        })

    return return_message('success', all_order_json)


@user_module.route('/test', methods=['GET'])
def test():
    # # this_user = User.objects.get(id='570fbe38edb62a217c267124')
    # this_user = User.objects(username='111').first()
    # print this_user.pk
    # return str(this_user.pk)
    return request.headers['token']
