# -*- coding: utf-8 -*-
from flask_restful import abort, reqparse
from functools import wraps
from app.lib.api_function import basic_authentication
from app.user.model import User
from app.book.model import Book


base_parse = reqparse.RequestParser()
base_parse.add_argument('page', type=int, default=1)


def authenticate(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        if not getattr(func, 'authenticated', True):
            return func(*args, **kwargs)

        ret, message = basic_authentication()
        if ret:
            return func(*args, **kwargs)

        abort(401, message=message)
    return wrapper


def username(name):
    if isinstance(name, basestring) and len(name) in range(2, 9):
        return name
    else:
        raise ValueError('WRONG_USERNAME')


def phone(number):
    if len(number) != 11 or number[0] != "1":
        raise ValueError('WRONG_PHONE_NUMBER')
    try:
        for one in number:
            int(one)
    except:
        raise ValueError('WRONG_PHONE_NUMBER')
    else:
        return number


def valid_object_id(check_id, name='ID'):
    if len(check_id) != 24:
        raise ValueError('INVALID_{}'.format(name.upper()))
    return check_id


def valid_book(isbn):
    this_book = Book.objects(isbn=isbn)
    if this_book.count() == 1:
        return this_book.first()
    else:
        raise ValueError('INVALID_ISBN')


def abort_valid_in_list(name, value, valid_list):
    if value not in valid_list:
        abort(400, message='INVALID_{}'.format(str(name).upper()))


def abort_invalid_isbn(isbn):
    this_book = Book.objects(isbn=isbn)
    if this_book.count() == 1:
        return this_book.first()
    else:
        abort(404, message='INVALID_ISBN')


def get_from_object_id(object_id, object_type, abort_name, verify_owner=True, **kwargs):
    try:
        valid_object_id(object_id, abort_name)
    except ValueError as ret:
        abort(400, message=str(ret))
    else:
        this_object = object_type.objects(pk=object_id).filter(**kwargs)
        if this_object.count() == 1:
            this_object = this_object.first()
            if verify_owner and 'user' in this_object:
                user = User.get_user_on_headers()
                if this_object.user != user:
                    abort(401, message='Unauthorized'.upper())

            return this_object
        else:
            abort(400, message='INVALID_{}'.format(str(abort_name).upper()))