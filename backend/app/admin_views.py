# -*- coding: utf-8 -*-

from time import localtime, strftime, time

from flask import redirect, url_for, flash
from flask_admin import expose, AdminIndexView
from flask_security import current_user
from jinja2 import Markup

from app import app
from app.models import *
from app.lib.restful import abort_invalid_isbn
from app.lib.admin_base import AdminBaseView
from app.lib.admin_base import AdminBaseModelView


class UserView(AdminBaseModelView):

    def _billing_num(view, context, model, name):
        return str(Billing.objects(user=User.objects(username=model.username).first()).count())

    column_formatters = {
        'billing': _billing_num
    }

    column_list = ('username', 'roles', 'credits', 'billing')


class ActivityView(AdminBaseModelView):

    def _enabled_check(view, context, model, name):
        if model.end_time < int(time()):
            return u'失效'
        else:
            return u'有效'

    column_formatters = {
        'image': AdminBaseModelView._list_thumbnail,
        'start_time': AdminBaseModelView._time_format,
        'end_time': AdminBaseModelView._time_format,
        'enabled': _enabled_check
    }
    column_list = ('image', 'title', 'url', 'enabled', 'start_time', 'end_time')


class BookListView(AdminBaseModelView):

    def _time_format(view, context, model, name):

        timestamp = getattr(model, name, None)
        if timestamp:
            return strftime("%Y-%m-%d %H:%M", localtime(timestamp))
        else:
            return ''

    def _list_thumbnail(view, context, model, name):
        if not model.image:
            return ''
        if model.image.is_cdn:
            return Markup('<img src="{}" style="max-width:200px;">'.format(model.image))
        else:
            if model.image.url[:4] == 'http':
                return Markup('<img src="{}" style="max-width:200px;">'.format(model.image.url))
            return Markup('<img src="%s" style="max-width:200px;">' % '{}'.format(model.image))

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

    def _collect_num(view, context, model, name):
        return str(Collect.objects(type='book', type_id=model.isbn).count())

    column_formatters = {
        'create_time': AdminBaseModelView._time_format,
        'collects': _collect_num,
    }

    column_sortable_list = ['title', 'rate', 'price', 'author']
    column_searchable_list = ['title']

    column_list = ('isbn', 'title', 'author', 'price', 'tag', 'rate', 'create_time', 'collects')

    create_template = 'admin-custom/book_create.html'

    edit_template = 'admin-custom/book_edit.html'


class TagView(AdminBaseModelView):
    pass


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
        if len(done_billings) != 0:
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
                    cart.book.add_storehouse(1, after_selling.status_to_string(after_selling.type))
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
            content=u"{}".format(request.form.get('reason'))
        ))
        after_selling.save()
        flash(u"ID为 {} 的订单已经处理, 处理结果: {} ".format(unicode(after_selling.pk), u"同意" if is_ok else u"拒绝"))

        return redirect(url_for("aftersellingbillingview.index"))


class StoreHouseView(AdminBaseView):

    @expose('/')
    def list(self):
        books = Book.objects()
        books_n = [book for book in books if book.need_to_refund != 0 or book.need_to_replace != 0]

        storehouse_need_operation = Storehouse.objects(status=Storehouse.STATUS_PROCESSING)

        storehouse_backup = {}
        for book in books:
            store = Storehouse.objects(book=book, status=Storehouse.STATUS_NORMAL, create_time__gt=time_int()-60*60*24*7)

            storehouse_backup[book.isbn] = store

        return self.render('admin-custom/storehouse/index.html',
                           books=books_n,
                           storehouse_need_operation=storehouse_need_operation,
                           storehouse_backup=storehouse_backup)

    @expose('/submit')
    def submit(self):

        storehouse_id = request.args.get('s_id')
        type = request.args.get('type')

        storehouse = Storehouse.objects(pk=storehouse_id).first()
        if type == 'refund':
            if storehouse.book.need_to_refund > 0:
                storehouse.book.add_storehouse(-1, 'REFUND')

                storehouse.process_status = 'REFUND'
                storehouse.status_changed_time = time_int()
                storehouse.status = Storehouse.STATUS_PROCESSING
                storehouse.save()
                flash(u"《{}》 进入 退货 处理状态".format(storehouse.book.title))
                return redirect(url_for("storehouseview.list"))

        elif type == 'replace':
            if storehouse.book.need_to_replace > 0:
                storehouse.book.add_storehouse(-1, 'REPLACE')

                storehouse.process_status = 'REPLACE'
                storehouse.status_changed_time = time_int()
                storehouse.status = Storehouse.STATUS_PROCESSING
                storehouse.save()
                flash(u"《{}》 进入 换货 处理状态".format(storehouse.book.title))
                return redirect(url_for("storehouseview.list"))
                # return

        flash(u"非法操作")
        return redirect(url_for("storehouseview.list"))

    @expose('/confirm')
    def confirm(self):
        pass