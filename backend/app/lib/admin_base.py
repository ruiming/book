# -*- coding: utf-8 -*-
from flask_admin.contrib.mongoengine import ModelView
from flask_admin import BaseView, expose, AdminIndexView
from flask_security import current_user
from flask import request, redirect, url_for

from app.auth.model import User
from app.user.model import Notice

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

    @expose('/')
    def index(self):
        return self.render('admin/index.html')

    @expose('/notice_sender', methods=['GET', 'POST'])
    def notice_sender(self):
        users = User.objects()

        if request.method == 'POST':
            content = request.form.get('content', None)
            url = request.form.get('url', None)
            for user in users:
                is_send = request.form.get(str(user.pk), None)
                if is_send == 'on':
                    Notice(
                        content=content,
                        url=url,
                        user=user
                    ).save()
            return redirect(url_for('admin.notice_sender'))
        return self.render('admin/notice_sender.html', users=users)





