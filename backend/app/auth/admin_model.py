# -*- coding: utf-8 -*-

from app.book.model import Book
from flask.ext.admin.contrib.mongoengine import ModelView
from flask_admin.form import rules


class UserView(ModelView):

    column_list = ('username', 'group', 'credits')
