# -*- coding: utf-8 -*-
from flask import Blueprint, jsonify, request
from app.book.model import BookList, Activity, Tag, Book
from app.user.model import Comment, Collect
from app.auth.model import User

from app.lib.common_function import return_message
from app.lib.api_function import allow_cross_domain
from app.lib.wechat import oauth4api

from json import dumps

book_modules = Blueprint('book_module', __name__)


@book_modules.route('/booklist', methods=['GET'])
@allow_cross_domain
@oauth4api
def booklist():
    """
    书单接口
    :return:
    """
    def sort_function(x, y):
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

    type = request.args.get('type', 'all')
    tag = request.args.get('tag', None)
    isbn = request.args.get('isbn', None)
    id = request.args.get('id', None)
    page = request.args.get('page', 1)
    page = int(page)

    if id is not None:
        # 单书单查询
        if len(id) != 24:
            return return_message('error', 'unknown id')

        this_book_list = BookList.objects(pk=id)
        this_book_list = this_book_list.first() if this_book_list.count() == 1 else None

        if this_book_list is None:
            # 无此书单
            return return_message('error', 'booklist not found')
        else:
            this_book_list_json = {
                'status': 'success',
                'title': this_book_list.title,
                'subtitle': this_book_list.subtitle,
                'author': {
                    'avatar': this_book_list.author.avatar or '',
                    'name': this_book_list.author.username or '',
                    'id': this_book_list.author.wechat_openid or ''
                },
                'description': this_book_list.description,
                'image': this_book_list.image,
                'collect': this_book_list.collect,
                'tag': [],
                'books': []
            }

            for one_tag in this_book_list.tag:
                if not isinstance(one_tag, Tag):
                    continue
                this_book_list_json['tag'].append(one_tag.name)

            for one_book in this_book_list.books:
                if not isinstance(one_book, Book):
                    continue
                this_book_list_json['books'].append({
                    'title': one_book.title,
                    'isbn': one_book.isbn,
                    'subtitle': one_book.subtitle,
                    'reason': one_book.reason,
                    'image': one_book.image,
                    'rate': one_book.rate,
                    'author': [one_author for one_author in one_book.author]
                })

            return return_message('success', {'data': this_book_list_json})



    # 多书籍查询
    if type not in ['all', 'hot', 'time', 'collect']:
        # 非法索引参数传入
        return return_message('error', 'unknown type')

    if tag is not None and isbn is not None:
        # 不允许 tag 和 isbn 同时传入
        return return_message('error', 'tag and isbn could not be existed at a same time')

    if tag is not None:
        # 按 tag 进行搜索
        all_booklist = BookList.objects(tag__in=Tag.objects(name=tag))

        if type == 'hot':
            all_booklist = all_booklist.order_by("-hot").limit(5).skip(5*(page-1))
        elif type == 'time':
            all_booklist = all_booklist.order_by("-create_time").limit(5).skip(5*(page-1))
        elif type == 'collect':
            all_booklist = all_booklist.order_by("-collect").limit(5).skip(5*(page-1))

        elif type == 'all':
            # 综合查询
            all_booklist = list(all_booklist)
            all_booklist = sorted(all_booklist, cmp=sort_function)
            all_booklist = all_booklist[5*(page-1):min(5*page, len(all_booklist))]


    if isbn is not None:
        # 按 isbn 进行搜索
        all_booklist = BookList.objects(books__in=Book.objects(isbn=isbn))

        if type == 'hot':
            all_booklist = all_booklist.order_by("-hot").limit(5).skip(5*(page-1))
        elif type == 'time':
            all_booklist = all_booklist.order_by("-create_time").limit(5).skip(5*(page-1))
        elif type == 'collect':
            all_booklist = all_booklist.order_by("-collect").limit(5).skip(5*(page-1))

        elif type == 'all':
            # 综合查询
            all_booklist = list(all_booklist)
            all_booklist = sorted(all_booklist, cmp=sort_function)
            all_booklist = all_booklist[5*(page-1):min(5*page, len(all_booklist))]


    if tag is None and isbn is None:
        # 无索引
        all_booklist = BookList.objects()
        if type == 'hot':
            all_booklist = all_booklist.order_by("-hot").limit(5).skip(5*(page-1))
        elif type == 'time':
            all_booklist = all_booklist.order_by("-create_time").limit(5).skip(5*(page-1))
        elif type == 'collect':
            all_booklist = all_booklist.order_by("-collect").limit(5).skip(5*(page-1))

        elif type == 'all':
            # 综合查询
            all_booklist = list(all_booklist)
            all_booklist = sorted(all_booklist, cmp=sort_function)
            all_booklist = all_booklist[5*(page-1):min(5*page, len(all_booklist))]

    all_book_list_json = []

    for x in all_booklist:
        all_book_list_json.append({
            'id': str(x.pk),
            'image': x.image,
            'title': x.title,
            'collect': x.collect,
            'description': x.description,
            'tags': [one_tag.name for one_tag in x.tag][:3]
        })

    return return_message('success', {'data': all_book_list_json})


@book_modules.route('/slides', methods=['GET'])
@allow_cross_domain
@oauth4api
def slides():
    # DONE

    id = request.args.get('id', None)
    if id is not None and len(id) == 24:
        all_activity = Activity.objects(enabled=True, pk=id).order_by("-start_time").limit(1)
    else:
        all_activity = Activity.objects(enabled=True).order_by("-start_time").limit(5)

    all_activity_json = []
    for id, activity in enumerate(all_activity):

        all_activity_json.append({
            'id': id,
            'image': str(activity.image),
            'title': activity.title,
            'url': activity.url if activity.url != '' else '/activity?id={}'.format(activity.pk)
        })

    return return_message('success', {'data': all_activity_json})


@book_modules.route('/book', methods=['GET'])
@allow_cross_domain
@oauth4api
def book():
    # TODO: 下面的评论是否被点过赞
    # TODO： 评论同时返回
    isbn = request.args.get('isbn', None)
    type = request.args.get('type', 'summary')

    if type not in ['summary', 'detail']:
        return return_message('error', 'unknown type')

    if isbn is None or isbn == '':
        return return_message('error', 'isbn could not be empty')

    this_book = Book.objects(isbn=isbn)
    this_book = this_book.first() if len(this_book) == 1 else None

    if this_book is None:
        return return_message('error', 'book do not exist')

    this_user = User.get_one_user(openid=request.headers['userid'])

    if type == 'summary':
        this_book_json = {
            'isbn': this_book.isbn,
            'title': this_book.title,
            'subtitle': this_book.subtitle,
            'author': this_book.author,
            'publish_time': this_book.publish_time,
            'image': this_book.image,
            'price': str(this_book.price),
            'publisher': this_book.publisher,
            'description': this_book.description,
            'tag': [],
            'comments': [],
            'rate': this_book.rate,
            'commenters': Comment.objects(book=this_book).count(),
            'collect_already': True if Collect.objects(type='book', type_id=this_book.isbn, user=this_user).count() == 1 else False
        }
    else:

        this_book_json = {
            'isbn': this_book.isbn,
            'title': this_book.title,
            'subtitle': this_book.subtitle,
            'origin_title': this_book.origin_title,
            'isbn': this_book.isbn,
            'author': this_book.author,
            'translator': this_book.translator,
            'create_time': this_book.create_time,
            'publish_time': this_book.publish_time,
            'image': this_book.image,
            'price': str(this_book.price),
            'page': this_book.page,
            'publisher': this_book.publisher,
            'catelog': this_book.catelog,
            'description': this_book.description,
            'author_description': this_book.author_description,
            'binding': this_book.binding,
            'rate': this_book.rate,
            'reason': this_book.reason
        }

    for one_tag in this_book.tag:
        this_book_json['tag'].append(one_tag.name)

    all_hot_comment = Comment.objects(book=this_book).order_by("-up").limit(5)
    for one_comment in all_hot_comment:
        this_book_json['comments'].append({
            'content': one_comment.content,
            'star': one_comment.star,
            'up': one_comment.up,
            'down': one_comment.down,
            # TODO: 添加该用户是否评论过此书。
            'create_time': one_comment.create_time,
            'user': {
                'username': one_comment.user.username,
                'avatar': one_comment.user.avatar
            }
        })

    return return_message('success', {'data': this_book_json})


@book_modules.route('/tags', methods=['GET'])
@allow_cross_domain
@oauth4api
def tags():
    # DONE

    type = request.args.get('type', 'all')

    if type not in ['hot', 'all']:
        return return_message('error', 'unknown type')

    if type == 'all':
        all_tag = Tag.objects()
        all_tag_json = []
        for one_tag in all_tag:
            pass
            is_added = False
            for one_tag_json in all_tag_json:
                if one_tag_json['title'] == one_tag.belong:
                    one_tag_json['tags'].append(one_tag.name)
                    is_added = True

            if not is_added:
                all_tag_json.append({
                    'title': one_tag.belong,
                    'tags': [one_tag.name]
                })

    elif type == 'hot':

        def tag_sort(x, y):
            # TODO: TAG 热门排序算法

            return 1 if x[0] > y[0] else -1

        all_tag = Tag.objects()
        all_tag_not_sort = []
        for one_tag in all_tag:
            all_tag_not_sort.append([
                BookList.objects(tag__in=Tag.objects(name=one_tag.name)).count(),
                one_tag
            ])

        all_tag_sorted = sorted(all_tag_not_sort, cmp=tag_sort)

        all_tag_json = []
        for one_tag in all_tag_sorted:
            all_tag_json.append(one_tag[1].name)

    return return_message('success', all_tag_json)
