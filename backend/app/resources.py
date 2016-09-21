# -*- coding: utf-8 -*-

from time import time
from random import randint

from flask_restful import Resource

from app.models import *

from app.lib import random_str, time_int
from app.lib.restful import *
from app.lib.api_function import send_sms_captcha


class SlidesResource(Resource):

    get_parser = reqparse.RequestParser()
    get_parser.add_argument('page', type=int, default=1)
    get_parser.add_argument('per_page', type=int, default=5)

    def get(self):
        args = self.get_parser.parse_args()

        activities = Activity.objects(enabled=True)\
            .order_by("-start_time")\
            .skip(args['per_page']*(args['page']-1))\
            .limit(args['per_page'])
        activities_json = []
        for a_id, activity in enumerate(activities):
            activities_json.append({
                'id': a_id,
                'slide_id': str(activity.pk),
                'image': str(activity.image),
                'title': activity.title,
                'url': activity.url if activity.url != '' else '/slide/{}'.format(activity.pk)
            })
        return activities_json


class SlideResource(Resource):

    @classmethod
    def get(cls, activity_id):

        activity = get_from_object_id(activity_id, Activity, 'ID')

        activity_json = {
            'slide_id': str(activity.pk),
            'image': str(activity.image),
            'title': activity.title,
            'url': activity.url if activity.url != '' else '/slide/{}'.format(activity.pk)

        }
        return activity_json


class BooksResource(Resource):

    get_parser = reqparse.RequestParser()
    get_parser.add_argument('page', type=int, default=1)
    get_parser.add_argument('per_page', type=int, default=5)

    def get(self, books_type):
        abort_valid_in_list('type', books_type, ['pop'])
        args = self.get_parser.parse_args()
        if books_type == 'pop':
            return self.pop_book(args)

    @classmethod
    def pop_book(cls, args):

        user_tags = []
        books_isbn = []

        user = User.get_user_on_headers()
        collects = Collect.objects(user=user, type='book')
        for collect in collects:
            book = Book.objects(isbn=collect.type_id)
            if book.count() == 1:
                book = book.first()
                for tag in book.tag:
                    user_tags.append(BookTag(name=tag.name))
                books_isbn.append(book.isbn)

        if user_tags:
            books = Book.objects(tag__in=user_tags).order_by("-rate").limit(args['per_page']).skip(args['per_page']*(args['page']-1))
        else:
            books = Book.objects().order_by("-rate").limit(args['per_page']).skip(args['per_page']*(args['page']-1))

        books = books

        books_json = []

        for book in books:
            if book.isbn not in books_isbn:
                books_json.append({
                    'title': book.title,
                    'isbn': book.isbn,
                    'subtitle': book.subtitle,
                    'image': book.image.get_full_url(),
                    'rate': book.rate,
                    'reason': book.reason
                })

        if user_tags and args['page'] == 1 and len(books_json) < args['per_page']:
            books = Book.objects().order_by("-rate").limit(args['per_page']*2)
            for book in books:
                is_in_books_json = False
                for one in books_json:
                    if book.isbn == one['title']:
                        is_in_books_json = True
                        break

                if not is_in_books_json and len(books_json) < args['per_page']:
                    books_json.append({
                        'title': book.title,
                        'isbn': book.isbn,
                        'subtitle': book.subtitle,
                        'image': book.image.get_full_url(),
                        'rate': book.rate,
                        'reason': book.reason
                    })

        return books_json


class SimilarBooksResource(Resource):

    @classmethod
    def get(cls, isbn):

        book = abort_invalid_isbn(isbn)

        carts = Cart.objects(book=book, status=Cart.STATUS_NORMAL)
        users = []
        for cart in carts:
            user = cart.user
            if user not in users:
                users.append(user)

        carts = Cart.objects(user__in=users, status=Cart.STATUS_NORMAL)
        books = []
        for cart in carts:
            if cart.book not in books:
                books.append(cart.book)

        # TODO: 算法优化
        books = books[:6]

        books_json = [{
                          'title': book.title,
                          'isbn': book.isbn,
                          'subtitle': book.subtitle,
                          'image': book.image.get_full_url(),
                          'rate': book.rate,
                          'reason': book.reason
                      } for book in books]

        return books_json


class BookResource(Resource):

    get_parser = reqparse.RequestParser()
    get_parser.add_argument('type', type=str, default='summary')

    def get(self, isbn):
        """
        读取单本书 详细 / 简略 内容
        :param isbn: 书本
        :return:
        """
        args = self.get_parser.parse_args()
        abort_valid_in_list('type', args['type'], ['summary', 'detail'])

        user = User.get_user_on_headers()
        book = abort_invalid_isbn(isbn)

        if args['type'] == 'summary':
            this_book_json = {
                'isbn': book.isbn,
                'title': book.title,
                'subtitle': book.subtitle,
                'author': book.author,
                'publish_time': book.publish_time,
                'image': book.image.get_full_url(),
                'price': str(book.price),
                'publisher': book.publisher,
                'description': book.description,
                'tag': [tag.name for tag in book.tag],
                'comments': [],
                'rate': book.rate,
                'commenters': Comment.objects(book=book).count(),
                'collect_already': True if Collect.objects(type='book', type_id=book.isbn,
                                                           user=user).count() == 1 else False
            }

            all_hot_comment = Comment.objects(book=book).order_by("-up").limit(3)
            for one_comment in all_hot_comment:
                up_already = True if UserCommentLove.objects(user=user, comment=one_comment,
                                                             type='up').count() == 1 else False
                down_already = True if UserCommentLove.objects(user=user, comment=one_comment,
                                                               type='down').count() == 1 else False
                this_book_json['comments'].append({
                    'id': str(one_comment.pk),
                    'content': one_comment.content,
                    'star': one_comment.star,
                    'up': one_comment.up,
                    'down': one_comment.down,
                    'up_already': up_already,
                    'down_already': down_already,
                    'create_time': one_comment.create_time,
                    'user': {
                        'username': one_comment.user.username,
                        'avatar': one_comment.user.full_link_avatar
                    }
                })
        elif args['type'] == 'detail':
            this_book_json = {
                'isbn': book.isbn,
                'title': book.title,
                'subtitle': book.subtitle,
                'origin_title': book.origin_title,
                'author': book.author,
                'translator': book.translator,
                'create_time': book.create_time,
                'publish_time': book.publish_time,
                'image': book.image.get_full_url(),
                'price': str(book.price),
                'page': book.page,
                'publisher': book.publisher,
                'catelog': book.catelog,
                'description': book.description,
                'author_description': book.author_description,
                'binding': book.binding,
                'rate': book.rate,
                'reason': book.reason
            }
        return this_book_json


class TagResource(Resource):

    get_parser = reqparse.RequestParser()
    get_parser.add_argument('type', type=str, default='all')

    def get(self):

        args = self.get_parser.parse_args()
        abort_valid_in_list('type', args['type'], ['all', 'hot'])

        tags = Tag.objects()
        tags_json = []

        if args['type'] == 'all':
            for tag in tags:
                is_added = False
                for tag_json in tags_json:
                    if tag_json['title'] == tag.belong:
                        tag_json['tags'].append(tag.name)
                        is_added = True

                if not is_added:
                    tags_json.append({
                        'title': tag.belong,
                        'tags': [tag.name]
                    })
        elif args['type'] == 'hot':
            def tag_sort(x, y):
                # TODO: TAG 热门排序算法
                return 1 if x[0] > y[0] else -1

            tags_not_sort = []
            for one_tag in tags:
                tags_not_sort.append([
                    BookList.objects(tag__in=Tag.objects(name=one_tag.name)).count(),
                    one_tag
                ])

            tags_sort = sorted(tags_not_sort, cmp=tag_sort)

            for one_tag in tags_sort:
                tags_json.append(one_tag[1].name)

        return tags_json


class BookListsResource(Resource):

    get_parser = reqparse.RequestParser()
    get_parser.add_argument('type', type=str, default='all')
    get_parser.add_argument('tag', type=unicode)
    get_parser.add_argument('isbn', type=str)
    get_parser.add_argument('page', type=int, default=1)
    get_parser.add_argument('per_page', type=int, default=5)

    def get(self):
        args = self.get_parser.parse_args()

        abort_valid_in_list('type', args['type'], ['all', 'hot', 'time', 'collect'])

        book_lists = BookList.objects()
        if args['tag']:
            book_lists = book_lists.filter(tag__in=Tag.objects(name=args['tag']))

        if args['isbn']:
            book_lists = book_lists.filter(books__in=Book.objects(isbn=args['isbn']))

        if args['type'] == 'all':
            book_lists = list(book_lists)
            book_lists = sorted(book_lists, cmp=self._sort_function)
            book_lists = book_lists[args['per_page'] * (args['page'] - 1):min(args['per_page'] * args['page'], len(book_lists))]

        else:
            type_sort_map = {
                'hot': '-hot',
                'time': '-create_time',
                'collect': '-collect'
            }
            book_lists = book_lists.order_by(type_sort_map[args['type']]).limit(args['per_page']).skip(args['per_page']*(args['page']-1))

        book_lists_json = []

        for book_list in book_lists:
            book_lists_json.append({
                'id': str(book_list.pk),
                'image': book_list.image.get_full_url(),
                'title': book_list.title,
                'collect': Collect.sum(book_list),
                'commenters': BookListComment.objects(book_list=book_list).count(),
                'description': book_list.description,
                'tags': [one_tag.name for one_tag in book_list.tag][:3]
            })

        return book_lists_json

    def _sort_function(self, x, y):
        """
        对书单进行综合排序
        :param x: BookList实例
        :param y: Booklist实例
        :return:
        """
        # TODO: 重定义权重
        x_mark = x.collect * 0.3 + x.hot * 0.7
        y_mark = y.collect * 0.3 + y.hot * 0.7
        if x_mark > y_mark:
            return 1
        else:
            return -1


class BookListResource(Resource):

    @classmethod
    def get(cls, book_list_id):

        book_list = get_from_object_id(book_list_id, BookList, 'book_list_id')
        user = User.get_user_on_headers()

        book_list_json = {
            'id': str(book_list.pk),
            'title': book_list.title,
            'subtitle': book_list.subtitle,
            'author': {
                'avatar': book_list.author.full_link_avatar,
                'name': book_list.author.username or '',
                'id': book_list.author.id or ''
            },
            'description': book_list.description,
            'image': book_list.image.get_full_url(),
            'collect': Collect.sum(book_list),
            'tags': [],
            'commenters': BookListComment.objects(book_list=book_list).count(),
            "collect_already": True if Collect.objects(user=user, type='booklist',
                                                       type_id=str(book_list.pk)).count() == 1 else False,
            'love': UserBookListLove.objects(book_list=book_list).count(),
            'love_already': True if UserBookListLove.objects(book_list=book_list,
                                                             user=user).count() == 1 else False,
            'books': []
        }

        for one_tag in book_list.tag:
            if not isinstance(one_tag, Tag):
                continue
            book_list_json['tags'].append(one_tag.name)

        for one_book in book_list.books:
            if not isinstance(one_book, Book):
                continue
            book_list_json['books'].append({
                'title': one_book.title,
                'isbn': one_book.isbn,
                'subtitle': one_book.subtitle,
                'reason': one_book.reason,
                'image': one_book.image.get_full_url(),
                'rate': one_book.rate,
                'author': [one_author for one_author in one_book.author]
            })

        return book_list_json


class BookListLoveResource(Resource):
    # /rest/booklist/<>/love
    """
    书单点赞
    """
    method_decorators = [authenticate]

    @classmethod
    def post(cls, book_list_id):
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
        comments = Comment.objects(book=book)\
            .order_by("create_time")\
            .limit(args['per_page'])\
            .skip(args['per_page']*(args['page']-1))

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
                    'avatar': comment.user.full_link_avatar,
                    'username': comment.user.username
                },
                'create_time': comment.create_time
            })

        return comments_json

    post_parser = reqparse.RequestParser()
    post_parser.add_argument('content', type=unicode, required=True, help='MISSING_CONTENT')
    post_parser.add_argument('star', type=int, default=0)

    @authenticate
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

    @classmethod
    def delete(cls, comment_id):
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
                    'avatar': comment.user.full_link_avatar,
                    'username': comment.user.username
                },
                'create_time': comment.create_time
            })
        return comments_json

    post_parser = reqparse.RequestParser()
    post_parser.add_argument('content', type=unicode, required=True, help='MISSING_CONTENT')
    post_parser.add_argument('star', type=int, default=0)

    @authenticate
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

    @classmethod
    def delete(cls, comment_id):
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
    method_decorators = [authenticate]

    @classmethod
    def post(cls, isbn):
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

    @classmethod
    def delete(cls, isbn):
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
    method_decorators = [authenticate]

    @classmethod
    def post(cls, book_list_id):
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

    @classmethod
    def delete(cls, book_list_id):
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
        cart = cart[0] if len(cart) > 0 else None
        user.add_cart(isbn, args['number'])
        number = args['number']
        if cart:
            number = cart.number

        if number <= 0:
            number = 0

        cart_json['number'] = min(number, 10)
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
            'all', Billing.Status.CREATING, Billing.Status.PENDING, Billing.Status.WAITING, Billing.Status.RECEIVED
        ])
        status = args['status']
        user = User.get_user_on_headers()

        billing = Billing.objects(user=user, status__ne='canceled')
        if status != 'all':
            billing = billing.filter(status=status)

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
                'edit_time': billing.edit_time,
                'replace_refund_processing': billing.replace_refund_processing
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
            user.add_cart(book.isbn, -1 * args['number'][l_id])
            for loop in range(args['number'][l_id]):
                cart = Cart(
                    book=book,
                    price=float(book.price),
                    user=user
                ).save()
                carts.append(cart)

        billing = Billing(
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

    @classmethod
    def get(cls, billing_id):
        """
        查看单个订单信息
        :param billing_id:
        :return:
        """
        billing = get_from_object_id(billing_id, Billing, 'billing_id')
        user = User.get_user_on_headers()
        billing_json = {
            'id': str(billing.pk),
            'status': billing.status,
            'status_list': [{
                                'status': one.status,
                                'content': one.content,
                                'time': str(one.time),
                                'backend': one.backend_operator
                            } for one in billing.status_list],
            'carts': [],
            'address': {
                'name': billing.address.name,
                'phone': billing.address.phone,
                'dormitory': billing.address.dormitory
            },
            'price': float(billing.get_sum_price()),
            'replace_refund_processing': billing.replace_refund_processing
        }

        for one_cart, number in billing.carts_info():

            cart_info = {
                'book': {
                    'isbn': one_cart.book.isbn,
                    'title': one_cart.book.title,
                    'image': one_cart.book.image.get_full_url(),
                    'authors': [one_author for one_author in one_cart.book.author]
                },
                'create_time': one_cart.create_time,
                'per_price': float(one_cart.price),
                'number': number,
                'price_sum': float(one_cart.price) * number,
                'status': Cart.status_to_string(one_cart.status)
            }
            if one_cart.status not in [Cart.STATUS_NORMAL]:
                after_selling = AfterSellBilling.objects(
                    billing=billing,
                    isbn=one_cart.book.isbn,
                    number=number,
                    user=user,
                    create_time__gte=one_cart.in_after_selling_time,
                    create_time__lte=one_cart.in_after_selling_time+5
                ).first()
                cart_info['after_selling_id'] = str(after_selling.pk)
            billing_json['carts'].append(cart_info)

        return billing_json

    @classmethod
    def delete(cls, billing_id):
        """
        删除一个订单
        :return:
        """
        billing = get_from_object_id(billing_id, Billing, 'billing_id')

        try:
            billing.change_status('canceled')
        except Billing.BillingErrorOperator as _:
            abort(400, message='BILLING_ERROR_OPERATOR')

        for cart in billing.carts:
            cart.change_status(Cart.STATUS_CANCELED)


class AfterSellBillingsResource(Resource):
    """
    用户所有的售后订单
    """
    method_decorators = [authenticate]

    @classmethod
    def get(cls):
        user = User.get_user_on_headers()
        after_selling_billings = AfterSellBilling.objects(user=user, canceled=False)

        billings_json = []
        for billing in after_selling_billings:
            cart = billing.get_cart()
            cart = cart[0]
            book = cart.book
            billings_json.append({
                'id': str(billing.pk),
                'billing_id': str(billing.billing.pk),
                'book': {
                    'title': book.title,
                    'isbn': book.isbn,
                    'image': book.image.get_full_url(),
                },
                'price': float(cart.price),
                'price_num': float(cart.price) * billing.number,
                'number': billing.number,
                'type': AfterSellBilling.status_to_string(billing.type),
                'reason': billing.reason,
                'is_done': billing.is_done,
                'create_time': billing.create_time,
                'process_change_time': billing.process_change_time,
                'process': billing.process

            })
        return billings_json


class BillingScoreResource(Resource):
    # /rest/billing/<>/score
    """
    订单评价
    """
    method_decorators = [authenticate]

    post_parser = reqparse.RequestParser()
    post_parser.add_argument('buy', type=int, required=True, location='form', help="MISSING_BUY_SCORE")
    post_parser.add_argument('transport', type=int, required=True, location='form', help="MISSING_TRANSPORT_SCORE")
    post_parser.add_argument('service', type=int, required=True, location='form', help="MISSING_SERVICE_SCORE")

    def post(self, billing_id):
        args = self.post_parser.parse_args()
        for key, value in args.items():
            args[key] = max(min(value, 10), 0)
        billing = get_from_object_id(billing_id, Billing, 'billing_id', status=Billing.Status.RECEIVED)

        billing.score_buy = args['buy']
        billing.score_transport = args['transport']
        billing.score_service = args['service']
        billing.change_status(Billing.Status.DONE)


class AfterSellBillingResource(Resource):
    # /rest/billings/<>/afterselling
    """
    售后账单
    """
    method_decorators = [authenticate]

    post_parser = reqparse.RequestParser()
    post_parser.add_argument('isbn', type=valid_book, dest='book', location='form', required=True, help="MISSING_OR_WRONG_ISBN")
    post_parser.add_argument('number', type=int, location='form')
    post_parser.add_argument('type', type=str, location='form')
    post_parser.add_argument('reason', type=unicode, location='form', required=True, help="MISSING_REASON")

    def post(self, billing_id):
        """
        提交售后账单
        :param billing_id:
        :return:
        """
        billing = get_from_object_id(billing_id, Billing, 'billing_id')
        if billing.status != Billing.Status.RECEIVED:
            abort(400, message="INVALID_BILLING_STATUS")

        user = User.get_user_on_headers()
        args = self.post_parser.parse_args()
        abort_valid_in_list('type', args['type'], ['replace', 'refund'])

        # Check billing valid number of this book
        after_selling_carts = []
        for cart in billing.carts:
            if cart.book.isbn == args['book'].isbn and cart.status in [Cart.STATUS_NORMAL, Cart.STATUS_REPLACE_END]:
                after_selling_carts.append(cart)

        if args['number'] <= 0 or len(after_selling_carts) < args['number']:
            abort(400, message='AFTER_SELLING_NUMBER_LIMIT')


        after_selling_carts = after_selling_carts[:args['number']]

        for one_cart in after_selling_carts:
            # Change status of one cart
            one_cart.in_after_selling_time = int(time())
            one_cart.save()
            if args['type'] == 'replace':
                one_cart.change_status(Cart.STATUS_REPLACE_PROCESSING)

            elif args['type'] == 'refund':
                one_cart.change_status(Cart.STATUS_REFUND_PROCESSING)

        after_sell_billing = AfterSellBilling(
            billing=billing,
            isbn=args['book'].isbn,
            number=args['number'],
            type=AfterSellBilling.REFUND if args['type'] == "refund" else AfterSellBilling.REPLACE,
            reason=args['reason'],
            user=user,
        ).save()

        after_sell_billing.feedback.append(BillingStatus(
            status=AfterSellBilling.WAITING,
            time=int(time()),
            content=u"售后订单创建成功"
        ))
        after_sell_billing.save()

        return {
            'id': str(after_sell_billing.pk),
            'billing_id': str(billing.pk),
            'isbn': args['book'].isbn,
            'number': args['number'],
            'type': args['type'],
            'reason': args['reason']
        }


class SingleAfterSellBillingResource(Resource):
    # /rest/billings/<>/afterselling/<>
    """
    单个售后账单
    """
    method_decorators = [authenticate]

    @classmethod
    def get(cls, billing_id, afterselling_id):
        billing = get_from_object_id(billing_id, Billing, 'billing_id')
        after_selling = get_from_object_id(afterselling_id, AfterSellBilling, 'afterseling_id', billing=billing,
                                           canceled=False)
        book = abort_invalid_isbn(after_selling.isbn)
        carts = after_selling.get_cart()
        one_cart = carts[0]
        return {
            'book': {
                'title': book.title,
                'image': str(book.image)
            },
            'number': after_selling.number,
            'type': AfterSellBilling.status_to_string(after_selling.type),
            'reason': after_selling.reason,
            'is_done': after_selling.is_done,
            'price': float(one_cart.price),
            'price_sum': float(one_cart.price) * after_selling.number,
            'create_time': after_selling.create_time,
            'process': after_selling.process,
            'feedback': [{
                'status': one.status,
                'time': one.time,
                'content': one.content
            } for one in after_selling.feedback]
        }

    @classmethod
    def delete(cls, billing_id, afterselling_id):
        """
        删除售后账单
        :param billing_id:
        :param afterselling_id:
        :return:
        """
        billing = get_from_object_id(billing_id, Billing, 'billing_id')
        afterseling = get_from_object_id(afterselling_id, AfterSellBilling, 'afterseling_id', billing=billing, canceled=False, is_done=False)

        if afterseling.process != AfterSellBilling.WAITING:
            abort(400, message="ERROR_AFTER_SELLING_BILLING_PROCESS")

        user = User.get_user_on_headers()

        query_set = {
            'user': user,
        }
        if afterseling.type == AfterSellBilling.REPLACE:
            query_set['status'] = Cart.STATUS_REPLACE_PROCESSING

        elif afterseling.type == AfterSellBilling.REFUND:
            query_set['status'] = Cart.STATUS_REFUND_PROCESSING

        carts = afterseling.get_cart()
        for cart in carts:
            cart.change_status(Cart.STATUS_NORMAL)

        afterseling.canceled = True
        afterseling.is_done = True
        afterseling.save()


class UserPhoneCaptchaResource(Resource):
    # /rest/user/captcha

    get_parser = reqparse.RequestParser()
    get_parser.add_argument('phone', type=phone, required=True, help="MISSING_OR_WRONG_PHONE")

    def get(self):
        args = self.get_parser.parse_args()

        # if not User.phone_check(args['phone']):
        #     abort(400, message={"phone": "PHONE_EXISTED"})

        users = User.objects(pk=args['phone'])
        if users.count() == 1:
            # 已经处在于数据库
            user = users.first()
            if time_int() - user.captcha_create_time <= 60:
                abort(400, message={"captcha": "SMS_CAPTCHA_TIME_LIMITED"})

            captcha = send_sms_captcha(args['phone'])
            user.captcha = captcha
            user.captcha_create_time = time_int()
            user.save()

        else:
            # 没在数据库

            captcha = send_sms_captcha(args['phone'])
            User(
                phone=args['phone'],
                captcha=captcha,
                captcha_create_time=time_int()
            ).save()


class UserTokenResource(Resource):
    # /rest/user/token

    get_parser = reqparse.RequestParser()
    get_parser.add_argument('phone', type=phone, required=True, help="MISSING_OR_WRONG_PHONE")
    get_parser.add_argument('captcha', type=int, required=True, help="MISSING_CAPTCHA")

    def get(self):
        args = self.get_parser.parse_args()
        user = User.objects(pk=args['phone'], register_done=True)
        if user.count() != 1:
            abort(400, message={"phone": "WRONG_PHONE"})

        user = user.first()

        if not (user.captcha == args['captcha'] and time_int() - user.captcha_create_time <= 5*60):
            abort(400, message={"captcha": "WRONG_CAPTCHA_OR_TIME_LIMITED"})

        user.token = random_str(24)
        user.captcha_create_time -= 60*5
        user.save()
        return {
            'phone': args['phone'],
            'token': user.token
        }

    post_parser = reqparse.RequestParser()
    post_parser.add_argument('phone', type=phone, required=True, help="MISSING_OR_WRONG_PHONE")
    post_parser.add_argument('token', type=str, required=True, help="MISSING_TOKEN")

    def post(self):
        args = self.post_parser.parse_args()
        if len(args['token']) != 24:
            abort(400, message={"token": "WRONG_TOKEN"})

        user = User.objects(pk=args['phone'], register_done=True)
        if user.count() != 1:
            abort(400, message={"phone": "WRONG_PHONE"})

        user = user.first()

        if user.token != args['token']:
            abort(400, message={"token": "WRONG_TOKEN"})

        user.token = random_str(24)
        user.save()
        return {
            'phone': args['phone'],
            'token': user.token
        }


class UserAvatarResource(Resource):

    @authenticate
    def post(self):
        avatar_max = 111
        random_avatar = randint(1, avatar_max)

        user = User.get_user_on_headers()
        user.avatar = random_avatar
        user.save()

        return {
            'avatar': user.avatar
        }


class UserResource(Resource):
    # /rest/user
    """
    用户信息
    """

    @authenticate
    def get(self):
        """
        读取用户信息
        :return:
        """
        user = User.get_user_on_headers()
        user_json = {
            'username': user.username,
            'avatar': user.full_link_avatar,
            'unread_notice': Notice.objects(user=user, is_read=False).count(),
            'cart_num': Cart.objects(user=user, status=1).count(),
            'billing': {
                Billing.Status.PENDING: Billing.objects(user=user, status=Billing.Status.PENDING).count(),
                Billing.Status.WAITING: Billing.objects(user=user, status=Billing.Status.WAITING).count(),
                Billing.Status.RECEIVED: Billing.objects(user=user, status=Billing.Status.RECEIVED).count()
            },
            'afterselling': AfterSellBilling.objects(
                user=user,
                is_done=False,
                canceled=False,
                process__in=[AfterSellBilling.WAITING, AfterSellBilling.PROCESSING]
            ).count()
        }

        return user_json

    post_parser = reqparse.RequestParser()
    post_parser.add_argument('username', type=username, required=True, location='form', help="MISSING_OR_WRONG_USERNAME")
    post_parser.add_argument('phone', type=phone, required=True, location='form', help="MISSING_OR_WRONG_PHONE")
    post_parser.add_argument('captcha', type=int, required=True, location='form', help="MISSING_CAPTCHA")
    post_parser.add_argument('avatar', type=int, required=True, location='form', help="MISSING_AVATAR")

    def post(self):
        args = self.post_parser.parse_args()

        user = User.objects(pk=args['phone'])
        if user.count() == 0:
            # 没在数据库中
            abort(400, message={"error": "ERROR_OPERATION"})

        # 手机已经注册
        user = user.first()
        if user.register_done:
            abort(400, message={"phone": "PHONE_EXISTED"})

        if not (args['captcha'] == user.captcha and int(time()) - user.captcha_create_time <= 60 * 30):
            abort(400, message={"captcha": "WRONG_CAPTCHA_OR_TIME_LIMITED"})

        user.username = args['username']
        user.avatar = str(args['avatar'])
        user.register_done = True
        user.token = random_str(24)
        user.captcha_create_time -= 60*30
        user.save()

        return {
            'token': user.token,
            'phone': user.phone,
            'username': user.username,
            'avatar': user.avatar
        }

    put_parser = reqparse.RequestParser()
    put_parser.add_argument('username', type=username, required=True, location='form',
                            help="MISSING_OR_WRONG_USERNAME")

    @authenticate
    def put(self):
        args = self.put_parser.parse_args()

        user = User.get_user_on_headers()

        user.username = args['username']
        user.save()

        return {
            'username': args['username']
        }


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

    @classmethod
    def delete(cls, address_id):
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

    @classmethod
    def get(cls):
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

    @classmethod
    def get(cls):
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

    @classmethod
    def get(cls):
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

    @classmethod
    def get(cls, notice_id):
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

    @classmethod
    def put(cls, notice_id):
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
