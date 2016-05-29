# -*- coding: utf-8 -*-
from flask.ext.admin.contrib.mongoengine import ModelView
from flask.ext.admin import BaseView, expose, AdminIndexView
from flask.ext.security import current_user

from time import localtime, strftime


class AdminBaseView(BaseView):

    def is_accessible(self):
        return current_user.has_role('admin')

    def _time_format(view, context, model, name):

        timestamp = getattr(model, name, None)
        if timestamp:
            return strftime("%Y-%m-%d %H:%M", localtime(timestamp))
        else:
            return ''


class AdminBaseModelView(ModelView):

    def is_accessible(self):
        return current_user.has_role('admin')

    def _time_format(view, context, model, name):

        timestamp = getattr(model, name, None)
        if timestamp:
            return strftime("%Y-%m-%d %H:%M", localtime(timestamp))
        else:
            return ''

class AdminView(AdminIndexView):

    def is_accessible(self):
        return current_user.has_role('admin')


    def __init__(self, name=None, category=None,
                 endpoint=None, url=None,
                 template='admin/index.html'):
        super(AdminView, self).__init__(name, category,
                 endpoint, url,
                 template)

