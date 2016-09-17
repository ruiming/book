# -*- coding: utf-8 -*-

from app.user.model import BillingStatus, Billing, Cart, Purchase, Storehouse, AfterSellBilling

from app.lib import time_int
from app.lib.admin_base import AdminBaseView
from flask_admin import expose
from flask import request, redirect, url_for, flash
from app.lib.restful import abort_invalid_isbn


class PendingBillingView(AdminBaseView):
    @expose('/')
    def index(self):

        billings = Billing.objects(status='pending')

        billings = billings.order_by('create_time')
        return self.render('admin-custom/pendingbilling/index.html', billings=billings)

    @expose('/save', methods=['POST'])
    def save(self):
        billings_id = request.form.getlist('billingid')
        billings_price_sum = 0
        books_num = 0
        billings = []
        for one_id in billings_id:
            try:
                this_billing = Billing.objects(pk=one_id)
                if this_billing.count() == 1:
                    this_billing = this_billing.first()
                    billings.append(this_billing)
                    billings_price_sum += this_billing.get_sum_price()
                    books_num += len(this_billing.carts)
            except:
                pass
        return self.render('admin-custom/pendingbilling/save.html',
                           billings=billings,
                           billings_price_sum=billings_price_sum,
                           books_num=books_num
        )

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
                        source=request.form.get('{}-source'.format(form_id), 'Unknown'),
                    ).save()

            Purchase(
                billings=billings,
                operator=request.form.get('operator', 'Unknown'),
                warehouse=request.form.get('warehouse', 'Unknown'),
                source=u"未知"
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

            return self.render('admin-custom/waitingbilling/index.html', billings=billings)


class AfterSellingBillingView(AdminBaseView):
    @expose('/')
    def index(self):
        after_selling_biilings = list(AfterSellBilling.objects(canceled=False, is_done=False))

        for one in after_selling_biilings:
            one.__setattr__('book', abort_invalid_isbn(one.isbn))

        return self.render('admin-custom/aftersellingbilling/index.html', billings=after_selling_biilings)

    @expose('/save', methods=['POST'])
    def save(self):

        after_selling = AfterSellBilling.objects(pk=request.form.get('billing_id')).first()
        is_ok = True if 'submit_ok' in request.form else False

        carts = after_selling.get_cart()

        next_status = AfterSellBilling.DONE

        if after_selling.process == AfterSellBilling.WAITING:

            if is_ok:
                next_status = AfterSellBilling.PROCESSING

                # change status of cart
                for cart in carts:
                    cart.change_status(after_selling.type*2 - 1)

            else:
                next_status = AfterSellBilling.REFUSED
                after_selling.is_done = True
                # change status of cart
                for cart in carts:
                    cart.change_status(Cart.STATUS_NORMAL)

        elif after_selling.process == AfterSellBilling.PROCESSING:

            if is_ok:
                next_status = AfterSellBilling.DONE
                after_selling.is_done = True
                # change status of cart
                for cart in carts:
                    cart.change_status(after_selling.type * 2)

            else:
                next_status = AfterSellBilling.REFUSED
                after_selling.is_done = True
                # change status of cart
                for cart in carts:
                    cart.change_status(Cart.STATUS_NORMAL)

        after_selling.change_process_status(next_status)
        after_selling.feedback.append(BillingStatus(
            status=next_status,
            time=time_int(),
            content=u"{}".format(next_status, request.form.get('reason'))
        ))
        after_selling.save()
        flash(u"ID为 {} 的订单已经处理, 处理结果: {} ".format(unicode(after_selling.pk), u"同意" if is_ok else u"拒绝"))

        return redirect(url_for("aftersellingbillingview.index"))
