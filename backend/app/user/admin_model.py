# -*- coding: utf-8 -*-

from app.book.model import Book
from app.auth.model import User

from app.lib.admin_base import AdminBaseModelView
from flask.ext.admin.contrib.mongoengine import ModelView
from flask_admin.form import rules
from flask.ext.security import current_user


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
            billing.status_list.append(BillingStatus(
                status='waiting',
                content=u"已发货，信息：{}".format(request.form.get('content', None)),
                backend_operator=True,
            ))
            billing.status = 'waiting'
            billing.edit_time = int(time())
            billing.save()


        if status == 'refund':
            pass

        if status == 'refunding':
            pass

        if status == 'replace':
            pass

        if status == 'replacing':
            pass
        return redirect(url_for('billingview.detail', billing_id=str(billing.pk)))
