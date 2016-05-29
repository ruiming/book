# -*- coding: utf-8 -*-
import os
import sys

from flask import Flask
from flask.ext.mongoengine import MongoEngine
from flask.ext.admin import Admin
from flask.ext.security import Security, MongoEngineUserDatastore
from wechatpy.oauth import WeChatOAuth
from qiniu import Auth, BucketManager

from celery import Celery

app = Flask(__name__)
app.config.from_object('config')

db = MongoEngine(app)

wechat = WeChatOAuth(app.config['CORP_ID'], app.config['SECRET'], "http://www.bookist.org/code2token", scope='snsapi_userinfo', state='55555')

q = Auth(app.config['QINIU_ACCESS_KEY'], app.config['QINIU_SECRET_KEY'])
b = BucketManager(q)

@app.errorhandler(404)
def not_found(error):
    return '404', 404


# Make the LazyText(Babel) JSON serializable


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

from flask.ext.admin.contrib.mongoengine import ModelView
from flask.ext.admin.contrib.fileadmin import FileAdmin

from app.lib.admin_base import AdminView, AdminBaseModelView
from app.book.model import BookList, Activity, Book, Tag, Applacation
from app.book.admin_model import BookView, TagView, BookListView, ActivityView
from app.auth.admin_model import UserView
from app.user.admin_model import BillingView
from app.auth.model import User, UserRole
from app.user.model import Comment, Points, Billing, Collect, Notice, Feedback, Cart


admin = Admin(app, template_mode='bootstrap3', name=u'Bookist.org 后台', index_view=AdminView(endpoint="admin"))

admin.add_view(BookListView(BookList, name=u'书单管理', category=u"书单相关"))
admin.add_view(ActivityView(Activity, name=u'活动管理'))
admin.add_view(BookView(Book, name=u'书籍管理'))
admin.add_view(TagView(Tag, name=u'书单标签', category=u"书单相关"))
admin.add_view(UserView(User, name=u'用户管理', category=u"用户相关"))
admin.add_view(AdminBaseModelView(UserRole, name=u'用户组', category=u"用户相关"))
admin.add_view(AdminBaseModelView(Cart, name=u'购物车', category=u"用户相关"))
admin.add_view(AdminBaseModelView(Comment, name=u"评论", category=u"用户相关"))
admin.add_view(AdminBaseModelView(Points, name=u"积分", category=u"用户相关"))
admin.add_view(AdminBaseModelView(Billing, name=u"订单"))
admin.add_view(BillingView(name=u"订单"))
admin.add_view(AdminBaseModelView(Collect, name=u"收藏", category=u"用户相关"))
admin.add_view(AdminBaseModelView(Notice, name=u"通知", category=u"用户相关"))
admin.add_view(AdminBaseModelView(Feedback, name=u"反馈信息"))


# Flask-Security

user_datastore = MongoEngineUserDatastore(db, User, UserRole)
security = Security(app, user_datastore)