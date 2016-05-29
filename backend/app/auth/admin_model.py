# -*- coding: utf-8 -*-

from app.book.model import Book
from app.auth.model import User

from app.lib.admin_base import AdminBaseModelView
from flask.ext.admin.contrib.mongoengine import ModelView
from flask_admin.form import rules
from flask.ext.security import current_user


from app.user.model import Billing

from jinja2 import Markup


class UserView(AdminBaseModelView):

    def _billing_num(view, context, model, name):
        return str(Billing.objects(user=User.objects(username=model.username).first()).count())

    column_formatters = {
        'billing': _billing_num
    }

    column_list = ('username', 'roles', 'credits', 'billing')
