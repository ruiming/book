# -*- coding: utf-8 -*-
import os
import sys

from flask import Flask
from flask_mongoengine import MongoEngine
from mongoengine import signals
from flask_admin import Admin
from flask_security import Security, MongoEngineUserDatastore
from wechatpy.oauth import WeChatOAuth
from qiniu import Auth, BucketManager
from flask_restful import Api

app = Flask(__name__)
app.config.from_object('config')

db = MongoEngine(app)

wechat = WeChatOAuth(app.config['CORP_ID'], app.config['SECRET'], "http://www.bookist.org/code2token", scope='snsapi_userinfo', state='55555')

q = Auth(app.config['QINIU_ACCESS_KEY'], app.config['QINIU_SECRET_KEY'])
b = BucketManager(q)

api = Api(app)


#
# @app.errorhandler(404)
# def not_found(error):
#     return '404', 404
#




# Later on you'll import the other blueprints the same way:
# from app.comments.views import mod as commentsModule
# from app.posts.views import mod as postsModule
# app.register_blueprint(commentsModule)
# app.register_blueprint(postsModule)

from app.book.view import book_modules
from app.auth.view import auth_module
from app.user.view import user_module
from app.outline_api.view import outline_module
app.register_blueprint(book_modules)
app.register_blueprint(user_module)
app.register_blueprint(auth_module)
app.register_blueprint(outline_module)


# Flask-Admin

from app.lib.admin_base import AdminView, AdminBaseModelView
from app.book.model import BookList, Activity, Book, Tag, Applacation
from app.book.admin_model import BookView, TagView, BookListView, ActivityView
from app.auth.admin_model import UserView
from app.user.admin_model import PendingBillingView, WaitingBillingView, AfterSellingBillingView
from app.auth.model import User, UserRole
from app.user.model import Comment, Points, Collect, Notice, Feedback


admin = Admin(app, template_mode='bootstrap3-full', name=u'Bookist.org 后台', index_view=AdminView(endpoint="admin"))

admin.add_view(BookListView(BookList, name=u'书单管理', category=u"书单相关"))
admin.add_view(ActivityView(Activity, name=u'活动管理'))
admin.add_view(BookView(Book, name=u'书籍管理'))
admin.add_view(TagView(Tag, name=u'书单标签', category=u"书单相关"))
admin.add_view(UserView(User, name=u'用户管理', category=u"用户相关"))
admin.add_view(AdminBaseModelView(UserRole, name=u'用户组', category=u"用户相关"))
admin.add_view(AdminBaseModelView(Comment, name=u"评论", category=u"用户相关"))
admin.add_view(AdminBaseModelView(Points, name=u"积分", category=u"用户相关"))
admin.add_view(PendingBillingView(name=u"待发货订单"))
admin.add_view(WaitingBillingView(name=u"待收货订单"))
admin.add_view(AfterSellingBillingView(name=u"售后订单"))
admin.add_view(AdminBaseModelView(Collect, name=u"收藏", category=u"用户相关"))
admin.add_view(AdminBaseModelView(Notice, name=u"通知", category=u"用户相关"))
admin.add_view(AdminBaseModelView(Feedback, name=u"反馈信息"))


# Flask-Security

user_datastore = MongoEngineUserDatastore(db, User, UserRole)
security = Security(app, user_datastore)


# Jinja2 Filter
from app.lib.jinja2 import jinja2_filter_datetime
app.add_template_filter(jinja2_filter_datetime, name='datetime')


# Flask-RestFul
from app.book.resource import BookResource, TagResource, SlideResource, SlidesResource, SimilarBooksResource, \
    BooksResource, BookListsResource, BookListResource

from app.user.resource import UserAddressResource, UserAddressListResource, FeedbackResource, UserNoticesResource, \
    UserNoticeResource, UserCollectsResource, UserPointsResource, UserCommentsResource, UserResource, \
    BookListLoveResource, BillingsResource, BillingResource, BookCommentsResource, BookCommentResource, \
    CartsResource, BookListCommentsResource, BookListCommentResource, BookCollectResource, BookListCollectResource, \
    AfterSellBillingResource, AfterSellBillingsResource, SingleAfterSellBillingResource, BillingScoreResource

# Slide
api.add_resource(SlidesResource, '/rest/slides')
api.add_resource(SlideResource, '/rest/slides/<activity_id>')

# Book
api.add_resource(BooksResource, '/rest/books/<books_type>')
api.add_resource(BookResource, '/rest/book/<isbn>')
api.add_resource(SimilarBooksResource, '/rest/book/<isbn>/similar')
api.add_resource(BookCollectResource, '/rest/book/<isbn>/collect')
api.add_resource(BookCommentsResource, '/rest/book/<isbn>/comments')
api.add_resource(BookCommentResource, '/rest/comments/<comment_id>')

# Book List
api.add_resource(BookListsResource, '/rest/booklists')
api.add_resource(BookListResource, '/rest/booklists/<book_list_id>')
api.add_resource(BookListLoveResource, '/rest/booklists/<book_list_id>/love')
api.add_resource(BookListCollectResource, '/rest/booklists/<book_list_id>/collect')
api.add_resource(BookListCommentsResource, '/rest/booklists/<book_list_id>/comments')
api.add_resource(BookListCommentResource, '/rest/booklistcomment/<comment_id>')

# Cart
api.add_resource(CartsResource, '/rest/carts')

# Billing
api.add_resource(BillingsResource, '/rest/billings')
api.add_resource(BillingResource, '/rest/billings/<billing_id>')
api.add_resource(BillingScoreResource, '/rest/billings/<billing_id>/score')
api.add_resource(AfterSellBillingResource, '/rest/billings/<billing_id>/afterselling')
api.add_resource(SingleAfterSellBillingResource, '/rest/billings/<billing_id>/afterselling/<afterselling_id>')
api.add_resource(AfterSellBillingsResource, '/rest/afterselling')

# User
api.add_resource(UserResource, '/rest/user')

api.add_resource(UserAddressListResource, '/rest/user/addresses')
api.add_resource(UserAddressResource, '/rest/user/addresses/<address_id>')

api.add_resource(UserNoticesResource, '/rest/user/notices')
api.add_resource(UserNoticeResource, '/rest/user/notices/<notice_id>')

api.add_resource(UserCollectsResource, '/rest/user/collects/<collect_type>')

api.add_resource(UserPointsResource, '/rest/user/points')

api.add_resource(UserCommentsResource, '/rest/user/comments')

# Other
api.add_resource(TagResource, '/rest/tags')
api.add_resource(FeedbackResource, '/rest/feedback')


