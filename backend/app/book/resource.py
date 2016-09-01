# -*- coding: utf-8 -*-
from flask_restful import Resource, reqparse
from app.lib.restful import authenticate
from app.lib.restful import abort_valid_in_list, abort_invalid_isbn, get_from_object_id
from app.user.model import Comment, Collect, UserCommentLove, Cart, UserBookListLove, BookListComment
from app.auth.model import User
from app.book.model import Tag, BookList, Activity, Book, BookTag


class SlidesResource(Resource):
    method_decorators = [authenticate]

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
    method_decorators = [authenticate]

    def get(self, activity_id):

        activity = get_from_object_id(activity_id, Activity, 'ID')

        activity_json = {
            'slide_id': str(activity.pk),
            'image': str(activity.image),
            'title': activity.title,
            'url': activity.url if activity.url != '' else '/slide/{}'.format(activity.pk)

        }
        return activity_json


class BooksResource(Resource):
    method_decorators = [authenticate]

    get_parser = reqparse.RequestParser()
    get_parser.add_argument('page', type=int, default=1)
    get_parser.add_argument('per_page', type=int, default=5)

    def get(self, books_type):
        abort_valid_in_list('type', books_type, ['pop'])

        args = self.get_parser.parse_args()
        if books_type == 'pop':
            return self.pop_book(args)

    def pop_book(self, args):

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

        if not user_tags and args['page'] == 1 and len(books_json) < args['per_page']:
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
    method_decorators = [authenticate]

    def get(self, isbn):

        book = abort_invalid_isbn(isbn)

        carts = Cart.objects(book=book, status=2)
        users = []
        for cart in carts:
            user = cart.user
            if user not in users:
                users.append(user)

        carts = Cart.objects(user__in=users, status=2)
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
    method_decorators = [authenticate]

    get_parser = reqparse.RequestParser()
    get_parser.add_argument('type', type=str, default='summary')

    def get(self, isbn):

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
                        'avatar': one_comment.user.avatar
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
    method_decorators = [authenticate]

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
    method_decorators = [authenticate]

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
    method_decorators = [authenticate]

    def get(self, book_list_id):

        book_list = get_from_object_id(book_list_id, BookList, 'book_list_id')
        user = User.get_user_on_headers()

        book_list_json = {
            'id': str(book_list.pk),
            'title': book_list.title,
            'subtitle': book_list.subtitle,
            'author': {
                'avatar': book_list.author.avatar or '',
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
