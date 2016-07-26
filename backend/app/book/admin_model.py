# -*- coding: utf-8 -*-

from flask import url_for
from jinja2 import Markup
from app.book.model import Book
from app.user.model import Collect
from flask_admin import form
from flask_admin.contrib.mongoengine import ModelView
from app.lib.admin_base import AdminBaseModelView
from app.book.model import BookTag, Tag, Activity
from app.auth.model import User
from flask_admin.form import rules

from time import localtime, strftime, time


class ActivityView(AdminBaseModelView):
    def _list_thumbnail(view, context, model, name):
        if not model.image:
            return ''
        if model.image[:4] == 'http':
            return Markup('<img src="{}" style="max-width:200px;">'.format(model.image))
        return Markup('<img src="%s" style="max-width:200px;">' % url_for('static',
                                                 filename=form.thumbgen_filename(model.image)))

    def _time_format(view, context, model, name):

        timestamp = getattr(model, name, None)
        if timestamp:
            return strftime("%Y-%m-%d %H:%M", localtime(timestamp))
        else:
            return ''

    def _enabled_check(view, context, model, name):
        if model.end_time < int(time()):
            return u'失效'
        else:
            return u'有效'
    column_formatters = {
        'image': _list_thumbnail,
        'start_time': _time_format,
        'end_time': _time_format,
        'enabled': _enabled_check
    }
    column_list = ('image', 'title', 'url', 'enabled', 'start_time', 'end_time')


class BookListView(AdminBaseModelView):
    def _list_thumbnail(view, context, model, name):
        if not model.image:
            return ''
        if model.image[:4] == 'http':
            return Markup('<img src="{}" style="max-height:70px;">'.format(model.image))
        return Markup('<img src="%s" style="max-height:70px;">' % url_for('static',
                                                 filename=form.thumbgen_filename(model.image)))

    def _time_format(view, context, model, name):

        timestamp = getattr(model, name, None)
        if timestamp:
            return strftime("%Y-%m-%d %H:%M", localtime(timestamp))
        else:
            return ''

    column_formatters = {
        'image': _list_thumbnail,
        'last_edit_time': _time_format,
    }
    column_list = ('image', 'title', 'subtitle', 'tag', 'author', 'hot', 'collect', 'last_edit_time')

    form_ajax_refs = {
        'author': {
            'fields': (User.username, User.id)
        },
        'tag': {
            'fields': (Tag.name, Tag.belong)
        }
    }



class BookView(AdminBaseModelView):

    def _time_format(view, context, model, name):

        timestamp = getattr(model, name, None)
        if timestamp:
            return strftime("%Y-%m-%d %H:%M", localtime(timestamp))
        else:
            return ''

    def _collect_num(view, context, model, name):
        return str(Collect.objects(type='book', type_id=model.isbn).count())

    column_formatters = {
        'create_time': _time_format,
        'collects': _collect_num,
    }

    column_sortable_list = ['title', 'rate', 'price', 'author']
    column_searchable_list = ['title']

    column_list = ('isbn', 'title', 'author', 'price', 'tag', 'rate', 'create_time', 'collects')

    create_template = 'admin/book_create.html'

    edit_template = 'admin/book_edit.html'



class TagView(AdminBaseModelView):
    pass

