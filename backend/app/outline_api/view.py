# -*- coding: utf-8 -*-

from flask import Blueprint
import urllib2

outline_module = Blueprint("outline_module", __name__)


@outline_module.route('/douban/<isbn>', methods=['GET'])
def douban_book(isbn=""):
    return urllib2.urlopen('https://api.douban.com/v2/book/isbn/{}'.format(isbn)).read()
