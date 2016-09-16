# -*- coding: utf-8 -*-
from flask_admin.contrib.mongoengine import ModelView
from flask_admin import BaseView, expose, AdminIndexView
from flask_security import current_user
from flask import request, redirect, url_for, flash
from app import app

from app.auth.model import User
from app.user.model import Notice, Billing, AfterSellBilling

from time import localtime, strftime, time


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
    @classmethod
    def list_thumbnail(view, context, model, name):
        if not model.image:
            return ''
        if model.image[:4] == 'http':
            return ('<img src="{}" style="max-width:200px;">'.format(model.image))
        return ('<img src="%s" style="max-width:200px;">' % '{}/{}'.format(app.config['IMAGE_CDN_BASE_URL'], model.image))



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

        now_time_day = (int(time()) - (int(time()) % 86400)) / 86400
        seven_days_ago = now_time_day * 86400 - 86400 * 6

        # 14天用户数量
        users = User.objects()
        user_list_day =[0 for i in range(0, 14)]
        for user in users:
            day = (user.create_time - (user.create_time % 86400)) / 86400
            day_to_now = now_time_day - day if now_time_day - day < 13 else -1
            if day_to_now != -1:
                user_list_day[14 - day_to_now - 1] += 1
        user_list_day_str = ', '.join([str(one) for one in user_list_day])

        # 7天内的订单数量
        seven_days_ago_billings = Billing.objects(create_time__gt=seven_days_ago)
        seven_days_billing_active = [0 for i in range(0, 7)]
        seven_days_billing_canceled = [0 for i in range(0, 7)]
        for billing in seven_days_ago_billings:

            day_to_now = (int(time()) - billing.create_time) / 86400
            print int(time()), billing.create_time, day_to_now


        return self.render('admin/index.html',
                           user_list_day_str=user_list_day_str,  # 14天新增用户数
                           user_count=User.objects().count(),  # 总用户数
                           billing_pending=Billing.objects(status='pending').count(),
                           billing_waiting=Billing.objects(status='waiting').count(),
                           after_selling=AfterSellBilling.objects(canceled=False, is_done=False).count(),

                           )

    @expose('/notice_sender', methods=['GET', 'POST'])
    def notice_sender(self):
        users = User.objects()

        if request.method == 'POST':
            title = request.form.get('title', None)
            content = request.form.get('content', None)
            url = request.form.get('url', None)
            for user in users:
                is_send = request.form.get(str(user.pk), None)
                if is_send == 'on':
                    Notice(
                        title=title,
                        content=content,
                        url=url,
                        user=user
                    ).save()
            flash(u"成功发送通知, 对象为: {}".format(" , ".join([user.username for user in users])))
            return redirect(url_for('admin.notice_sender'))
        return self.render('admin/notice_sender.html', users=users)





