# -*- coding: utf-8 -*-

from app.user.model import BillingStatus, Billing, Cart, Purchase, Storehouse

from app.lib import time_int
from app.lib.admin_base import AdminBaseView
from flask_admin import expose
from flask import request, redirect, url_for, flash


# class BillingView(AdminBaseView):
#     @expose('/')
#     def index(self):
#         page = request.args.get('page', 1)
#         type = request.args.get('type', None)
#         order = request.args.get('order', '-create_time')
#         if type:
#             billings = Billing.objects(status=type)
#         else:
#             billings = Billing.objects(status__not__in=['canceled', 'close'])
#
#         billings = billings.order_by(order).limit(30).skip(30*(page-1))
#         return self.render('admin/billing/index.html', billings=billings)
#
#     @expose('/detail/<billing_id>')
#     def detail(self, billing_id):
#         try:
#             billing = Billing.objects(pk=billing_id).first()
#         except:
#             abort(404)
#
#         return self.render('admin/billing/detail.html', billing=billing)
#
#     @expose('/changestatus/<billing_id>/<status>')
#     def change_status(self, billing_id, status):
#         try:
#             billing = Billing.objects(pk=billing_id).first()
#         except:
#             abort(404)
#
#         billing.change_status_force(status, u'管理员强制更新状态')
#         return redirect(url_for('billingview.detail', billing_id=billing_id))
#
#     @expose('/next/<billing_id>/<status>', methods=['POST'])
#     def next(self, billing_id, status):
#         print request.form
#         billing = Billing.objects(pk=billing_id).first()
#
#         if status == 'pending':
#             content = request.form.get('content', None)
#
#             billing.add_log_backend(
#                 status='waiting',
#                 content=u"已发货，信息：{}".format(content) if content != '' else u"已发货",
#             )
#
#         if status == 'refund':
#             is_ok = request.form.get('is_ok', 'no')
#             content = request.form.get('content', None)
#
#             if is_ok == 'no':  # 拒绝退款/退货
#
#                 billing.add_log_backend(
#                     status='refund_refused',
#                     content=u"拒绝退款(退货)，原因：{}".format(content) if content != '' else u"拒绝退款(退货)",
#                 )
#
#             elif is_ok == 'on':  # 同意退款/退货
#
#                 billing.add_log_backend(
#                     status='refunding',
#                     content=u"同意退款(退货)，原因：{}".format(content) if content != '' else u"同意退款(退货)",
#                 )
#
#         if status == 'refunding':
#             is_ok = request.form.get('is_ok', 'no')
#             content = request.form.get('content', None)
#
#             if is_ok == 'no':  # 拒绝 确认退款处理
#
#                 billing.add_log_backend(
#                     status='refund_refused',
#                     content=u"退款(退货)失败，原因：{}".format(content) if content != '' else u"退款(退货)失败",
#                 )
#
#             elif is_ok == 'on':  # 同意 确认退款处理
#
#                 billing.add_log_backend(
#                     status='refunded',
#                     content=u"退款(退货)成功，原因：{}".format(content) if content != '' else u"退款(退货)成功",
#                 )
#
#         if status == 'replace':
#             is_ok = request.form.get('is_ok', 'no')
#             content = request.form.get('content', None)
#
#             if is_ok == 'no':  # 拒绝 换货
#
#                 billing.add_log_backend(
#                     status='replace_refused',
#                     content=u"拒绝换货，原因：{}".format(content) if content != '' else u"拒绝换货",
#                 )
#
#             elif is_ok == 'on':  # 同意 换货
#
#                 billing.add_log_backend(
#                     status='replacing',
#                     content=u"同意换货，原因：{}".format(content) if content != '' else u"同意换货",
#                 )
#
#         if status == 'replacing':
#             is_ok = request.form.get('is_ok', 'no')
#             content = request.form.get('content', None)
#
#             if is_ok == 'no':  # 拒绝 确认换货处理
#
#                 billing.add_log_backend(
#                     status='replace_refused',
#                     content=u"换货失败，原因：{}".format(content) if content != '' else u"换货失败",
#                 )
#
#             elif is_ok == 'on':  # 同意 确认换货处理
#
#                 billing.add_log_backend(
#                     status='replaced',
#                     content=u"换货成功，原因：{}".format(content) if content != '' else u"换货成功",
#                 )
#
#         return redirect(url_for('billingview.detail', billing_id=str(billing.pk)))


class PendingBillingView(AdminBaseView):
    @expose('/')
    def index(self):

        billings = Billing.objects(status='pending')

        billings = billings.order_by('create_time')
        return self.render('admin/pendingbilling/index.html', billings=billings)

    @expose('/save', methods=['POST'])
    def save(self):
        billings_id = request.form.getlist('billingid')
        billings = []
        for one_id in billings_id:
            try:
                this_billing = Billing.objects(pk=one_id)
                if this_billing.count() == 1:
                    billings.append(this_billing.first())
            except:
                pass
        return self.render('admin/pendingbilling/save.html', billings=billings)

    @expose('/savein', methods=['POST'])
    def savein(self):
        billings_id = request.form.getlist('billing_id')
        billings = []
        for billing_id in billings_id:
            billing = Billing.objects(pk=billing_id)
            if billing.count() == 1:
                billings.append(billing.first())

        if billings:
            for one in billings:
                one.change_status_force('waiting', u"已发货")
                one.in_purchase_time = time_int()
                one.save()
                for cart in one.carts:
                    form_id = '{}-{}'.format(str(one.pk), str(cart.pk))
                    value = request.form.get(form_id)
                    cart.real_price = float(value)
                    cart.save()

                    # Saving StoreHouse
                    Storehouse(
                        book=cart.book,
                        price=cart.price,
                        real_price=cart.real_price,
                        source=request.form.get('source', 'Unknown'),
                    ).save()

            Purchase(
                billings=billings,
                operator=request.form.get('operator', 'Unknown'),
                warehouse=request.form.get('warehouse', 'Unknown'),
                source=request.form.get('source', 'Unknown'),
            ).save()
            flash(u"已经生成采货单")
        else:
            flash(u"数据为空")
        return redirect(url_for("pendingbillingview.index"))


class WaitingBillingView(AdminBaseView):

    @staticmethod
    def _sort(one, two):
        if one.in_purchase_time - one.create_time > two.in_purchase_time - two.create_time:
            return -1
        return 1

    @expose('/')
    def index(self):
        billing_id = request.args.get('id', None)
        if billing_id:
            billing = Billing.objects(pk=billing_id).first()
            billing.add_log_backend('received', u"书籍已经送达")

            flash(u"ID为 {} 的订单已送达".format(billing_id))
            return redirect(url_for("waitingbillingview.index"))

        else:

            billings = Billing.objects(status='waiting')

            billings = billings.order_by('create_time')
            billings = sorted(billings, cmp=self._sort)

            return self.render('admin/waitingbilling/index.html', billings=billings)
