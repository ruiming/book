# -*- coding: utf-8 -*-
from flask_admin.contrib.mongoengine import ModelView
from flask_admin import BaseView, expose, AdminIndexView
from flask_security import current_user
from flask import request, redirect, url_for, flash
from app import app

from app.auth.model import User
from app.user.model import Notice, Billing, AfterSellBilling, Storehouse

from time import localtime, strftime, time


class AdminBaseView(BaseView):

    def is_accessible(self):
        return current_user.has_role('admin')

    def _time_format(self, context, model, name):

        timestamp = getattr(model, name, None)
        if timestamp:
            return strftime("%Y-%m-%d %H:%M", localtime(timestamp))
        else:
            return ''


class AdminBaseModelView(ModelView):

    def is_accessible(self):
        return current_user.has_role('admin')

    def _time_format(self, context, model, name):

        timestamp = getattr(model, name, None)
        if timestamp:
            return strftime("%Y-%m-%d %H:%M", localtime(timestamp))
        else:
            return ''

    @classmethod
    def list_thumbnail(cls, context, model, name):
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
                 template='admin-custom/index.html'):
        super(AdminView, self).__init__(name, category, endpoint, url, template)

    @expose('/')
    def index(self):

        now_time_day = (int(time()) - (int(time()) % 86400)) / 86400
        seven_days_ago = now_time_day * 86400 - 86400 * 6
        fourteen_days_ago = now_time_day * 86400 - 86400 * 13

        # 14天用户数量
        users = User.objects()
        user_list_day = [0 for _ in range(0, 14)]
        for user in users:
            day = (user.create_time - (user.create_time % 86400)) / 86400
            day_to_now = now_time_day - day if now_time_day - day < 13 else -1
            if day_to_now != -1:
                user_list_day[14 - day_to_now - 1] += 1
        user_list_day_str = ', '.join([str(one) for one in user_list_day])

        # 7天内的订单数量
        seven_days_ago_billings = Billing.objects(create_time__gt=seven_days_ago)
        seven_days_billing_active = [0 for _ in range(0, 7)]
        seven_days_billing_canceled = [0 for _ in range(0, 7)]
        for billing in seven_days_ago_billings:

            day_to_now = (int(time()) - billing.create_time) / 86400
            if billing.status == Billing.Status.CANCELED:
                seven_days_billing_canceled[day_to_now] += 1
            else:
                seven_days_billing_active[day_to_now] += 1
        seven_days_billing_active_str = ', '.join([str(one) for one in seven_days_billing_active[::-1]])
        seven_days_billing_canceled_str = ', '.join([str(one) for one in seven_days_billing_canceled[::-1]])

        # 14天的收支金额
        storehouse_14 = Storehouse.objects(create_time__gt=fourteen_days_ago)
        storehouse_14_price = [0 for _ in range(0, 14)]
        storehouse_14_real_price = [0 for _ in range(0, 14)]
        storehouse_14_all = [0 for _ in range(0, 14)]
        for one in storehouse_14:
            day_to_now = (int(time()) - one.create_time) / 86400
            storehouse_14_price[day_to_now] += one.price
            storehouse_14_real_price[day_to_now] += one.real_price

        for id, _ in enumerate(storehouse_14_all):
            storehouse_14_all[id] = storehouse_14_price[id] - storehouse_14_real_price[id]

        storehouse_14_price_str = ', '.join([str(one) for one in storehouse_14_price[::-1]])
        storehouse_14_real_price_str = ', '.join([str(one) for one in storehouse_14_real_price[::-1]])
        storehouse_14_all_str = ', '.join([str(one) for one in storehouse_14_all[::-1]])

        # 总收支
        storehouse = Storehouse.objects()
        storehouse_price = 0
        storehouse_real_price = 0
        for one in storehouse:
            storehouse_price += one.price
            storehouse_real_price += one.real_price

        storehouse_all = storehouse_price - storehouse_real_price

        # 平台评分
        done_billings = Billing.objects(status=Billing.Status.DONE)

        score_buy = 0
        score_transport = 0
        score_service = 0

        for billing in done_billings:
            score_buy += billing.score_buy
            score_transport += billing.score_transport
            score_service += billing.score_service

        score_buy = float(score_buy) / float(len(done_billings))
        score_transport = float(score_transport) / float(len(done_billings))
        score_service = float(score_service) / float(len(done_billings))


        return self.render('admin-custom/index.html',
                           user_list_day_str=user_list_day_str,  # 14天新增用户数
                           user_count=User.objects().count(),  # 总用户数
                           billing_pending=Billing.objects(status='pending').count(),  # 待发货订单数量
                           billing_waiting=Billing.objects(status='waiting').count(),  # 待收货订单数量
                           after_selling=AfterSellBilling.objects(canceled=False, is_done=False).count(),  # 售后订单数量
                           seven_days_billing_active_str=seven_days_billing_active_str,  # 7天内有效订单
                           seven_days_billing_canceled_str=seven_days_billing_canceled_str,  # 7天无效订单
                           storehouse_14_price_str=storehouse_14_price_str,  # 14天收入
                           storehouse_14_real_price_str=storehouse_14_real_price_str,  # 14天支出
                           storehouse_14_all_str=storehouse_14_all_str,  # 14天利润
                           storehouse_price=storehouse_price,  # 总收入
                           storehouse_real_price=storehouse_real_price,  # 总支出
                           storehouse_all=storehouse_all,  # 总利润
                           score_buy=score_buy,  # 购书体验
                           score_transport=score_transport,  # 物流服务
                           score_service=score_service,  # 服务态度
                           )

    @expose('/notice_sender', methods=['GET', 'POST'])
    def notice_sender(self):
        users = User.objects()

        if request.method == 'POST':
            title = request.form.get('title', None)
            content = request.form.get('content', None)
            url = request.form.get('url', None)
            send_user = []
            for user in users:
                is_send = request.form.get(str(user.pk), None)
                if is_send == 'on':
                    send_user.append(user.username)
                    Notice(
                        title=title,
                        content=content,
                        url=url,
                        user=user
                    ).save()

            flash(u"成功发送通知, 对象为: {}".format(" , ".join([user for user in send_user])))
            return redirect(url_for('admin.notice_sender'))
        return self.render('admin-custom/notice_sender.html', users=users)





