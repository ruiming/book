# -*- coding: utf-8 -*-
from flask_admin.contrib.mongoengine import ModelView
from flask_admin import BaseView
from flask_security import current_user
import jinja2
from app.models import *
from time import localtime, strftime, time


class AdminBaseView(BaseView):

    def is_accessible(self):
        return current_user.has_role('admin')


class AdminBaseModelView(ModelView):

    def is_accessible(self):
        return current_user.has_role('admin')

    @classmethod
    def _time_format(cls, view, context, model, name):

        timestamp = getattr(model, name, None)
        if timestamp:
            return strftime("%Y-%m-%d %H:%M", localtime(timestamp))
        else:
            return ''

    @classmethod
    def _list_thumbnail(cls, view, context, model, name):
        if not model.image:
            return ''
        if model.image.is_cdn:
            return jinja2.Markup('<img src="{}" style="max-width:200px;">'.format(model.image))
        else:
            if model.image.url[:4] == 'http':
                return jinja2.Markup('<img src="{}" style="max-width:200px;">'.format(model.image.url))
            return jinja2.Markup('<img src="%s" style="max-width:200px;">' % '{}/{}'.format(app.config['IMAGE_CDN_BASE_URL'],
                                                                                     model.image))

