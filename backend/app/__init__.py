# -*- coding: utf-8 -*-
import os
import sys

from flask import Flask
from flask.ext.mongoengine import MongoEngine
from flask.ext.admin import Admin
from wechatpy.oauth import WeChatOAuth

from celery import Celery

app = Flask(__name__)
app.config.from_object('config')


admin = Admin(app, template_mode='bootstrap3')
db = MongoEngine(app)

wechat = WeChatOAuth(app.config['CORP_ID'], app.config['SECRET'], "http://www.bookist.org/code2token", scope='snsapi_userinfo', state='55555')


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

from app.book.model import BookList, Activity, Book, Tag, Applacation
from app.book.admin_model import BookView, TagView, BookListView, ActivityView
from app.auth.admin_model import UserView
from app.auth.model import User
from app.user.model import Comment, Points, Order, Collect


admin.add_view(BookListView(BookList, name=u'书单管理'))
admin.add_view(ActivityView(Activity, name=u'活动管理'))
admin.add_view(BookView(Book, name=u'书籍管理'))
admin.add_view(TagView(Tag, name=u'书单标签'))
admin.add_view(ModelView(Applacation))
admin.add_view(UserView(User, name=u'用户管理'))
admin.add_view(ModelView(Comment))
admin.add_view(ModelView(Points))
admin.add_view(ModelView(Order))
admin.add_view(ModelView(Collect))
