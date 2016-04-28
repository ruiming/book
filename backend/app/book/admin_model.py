# -*- coding: utf-8 -*-

from flask import url_for
from jinja2 import Markup
from app.book.model import Book
from flask_admin import form
from flask.ext.admin.contrib.mongoengine import ModelView
from app.book.model import BookTag, Tag, Activity
from app.auth.model import User
from flask_admin.form import rules


class ActivityView(ModelView):
    def _list_thumbnail(view, context, model, name):
        if not model.image:
            return ''
        if model.image[:4] == 'http':
            return Markup('<img src="{}" style="max-width:200px;">'.format(model.image))
        return Markup('<img src="%s" style="max-width:200px;">' % url_for('static',
                                                 filename=form.thumbgen_filename(model.image)))

    column_formatters = {
        'image': _list_thumbnail
    }
    column_list = ('image', 'title', 'url', 'enabled', 'start_time', 'end_time')


class BookListView(ModelView):
    def _list_thumbnail(view, context, model, name):
        if not model.image:
            return ''
        if model.image[:4] == 'http':
            return Markup('<img src="{}" style="max-height:70px;">'.format(model.image))
        return Markup('<img src="%s" style="max-height:70px;">' % url_for('static',
                                                 filename=form.thumbgen_filename(model.image)))

    column_formatters = {
        'image': _list_thumbnail
    }
    column_list = ('image', 'pk', 'title', 'subtitle', 'tag', 'author', 'hot', 'collect', 'last_edit_time')

    form_ajax_refs = {
        'author': {
            'fields': (User.username, User.wechat_openid)
        },
        'tag': {
            'fields': (Tag.name, Tag.belong)
        }
    }



class BookView(ModelView):

    column_list = ('isbn', 'title', 'author', 'price', 'tag', 'rate', 'create_time')

    create_template = 'admin/book_create.html'

    edit_template = 'admin/book_edit.html'


class TagView(ModelView):
    pass
