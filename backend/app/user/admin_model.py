# -*- coding: utf-8 -*-

from app.user.model import Billing, BillingStatus

from app.lib.admin_base import AdminBaseView
from flask_admin import expose
from flask import abort, request, redirect, url_for
from time import time


class BillingView(AdminBaseView):
    @expose('/')
    def index(self):
        page = request.args.get('page', 1)
        type = request.args.get('type', None)
        order = request.args.get('order', '-create_time')
        if type:
            billings = Billing.objects(status=type)
        else:
            billings = Billing.objects(status__not__in=['canceled', 'close'])

        billings = billings.order_by(order).limit(30).skip(30*(page-1))
        return self.render('admin/billing/index.html', billings=billings)

    @expose('/detail/<billing_id>')
    def detail(self, billing_id):
        try:
            billing = Billing.objects(pk=billing_id).first()
        except:
            abort(404)

        return self.render('admin/billing/detail.html', billing=billing)

    @expose('/changestatus/<billing_id>/<status>')
    def change_status(self, billing_id, status):
        try:
            billing = Billing.objects(pk=billing_id).first()
        except:
            abort(404)

        billing.change_status_force(status, u'管理员强制更新状态')
        return redirect(url_for('billingview.detail', billing_id=billing_id))

    @expose('/next/<billing_id>/<status>', methods=['POST'])
    def next(self, billing_id, status):
        print request.form
        billing = Billing.objects(pk=billing_id).first()

        if status == 'pending':
            content = request.form.get('content', None)

            billing.add_log_backend(
                status='waiting',
                content=u"已发货，信息：{}".format(content) if content != '' else u"已发货",
            )

        if status == 'refund':
            is_ok = request.form.get('is_ok', 'no')
            content = request.form.get('content', None)

            if is_ok == 'no':  # 拒绝退款/退货

                billing.add_log_backend(
                    status='refund_refused',
                    content=u"拒绝退款(退货)，原因：{}".format(content) if content != '' else u"拒绝退款(退货)",
                )

            elif is_ok == 'on':  # 同意退款/退货

                billing.add_log_backend(
                    status='refunding',
                    content=u"同意退款(退货)，原因：{}".format(content) if content != '' else u"同意退款(退货)",
                )

        if status == 'refunding':
            is_ok = request.form.get('is_ok', 'no')
            content = request.form.get('content', None)

            if is_ok == 'no':  # 拒绝 确认退款处理

                billing.add_log_backend(
                    status='refund_refused',
                    content=u"退款(退货)失败，原因：{}".format(content) if content != '' else u"退款(退货)失败",
                )

            elif is_ok == 'on':  # 同意 确认退款处理

                billing.add_log_backend(
                    status='refunded',
                    content=u"退款(退货)成功，原因：{}".format(content) if content != '' else u"退款(退货)成功",
                )

        if status == 'replace':
            is_ok = request.form.get('is_ok', 'no')
            content = request.form.get('content', None)

            if is_ok == 'no':  # 拒绝 换货

                billing.add_log_backend(
                    status='replace_refused',
                    content=u"拒绝换货，原因：{}".format(content) if content != '' else u"拒绝换货",
                )

            elif is_ok == 'on':  # 同意 换货

                billing.add_log_backend(
                    status='replacing',
                    content=u"同意换货，原因：{}".format(content) if content != '' else u"同意换货",
                )

        if status == 'replacing':
            is_ok = request.form.get('is_ok', 'no')
            content = request.form.get('content', None)

            if is_ok == 'no':  # 拒绝 确认换货处理

                billing.add_log_backend(
                    status='replace_refused',
                    content=u"换货失败，原因：{}".format(content) if content != '' else u"换货失败",
                )

            elif is_ok == 'on':  # 同意 确认换货处理

                billing.add_log_backend(
                    status='replaced',
                    content=u"换货成功，原因：{}".format(content) if content != '' else u"换货成功",
                )

        return redirect(url_for('billingview.detail', billing_id=str(billing.pk)))
