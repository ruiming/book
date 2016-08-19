# -*- coding: utf-8 -*-

from flask import Blueprint, request, abort
import urllib2, base64, unicodedata
from urllib import unquote
from app import b


outline_module = Blueprint("outline_module", __name__)


@outline_module.route('/douban/<isbn>', methods=['GET'])
def douban_book(isbn=""):
    return urllib2.urlopen('https://api.douban.com/v2/book/isbn/{}'.format(isbn)).read()


