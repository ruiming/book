# -*- coding: utf-8 -*-

from flask import Blueprint, request, abort
import urllib2, base64, unicodedata
from urllib import unquote
from app import b


outline_module = Blueprint("outline_module", __name__)


@outline_module.route('/douban/<isbn>', methods=['GET'])
def douban_book(isbn=""):
    return urllib2.urlopen('https://api.douban.com/v2/book/isbn/{}'.format(isbn)).read()


@outline_module.route('/saveimg/<urlbase64>', methods=['GET'])
def douban_save_image(urlbase64=""):
    """
    用户保存豆瓣图书的图片至本地/CDN
    :param urlmd5: 需要保存的图片的BASE64值
    :return:
    """

    isbn = request.args.get('isbn', None)
    if urlbase64 == '' or not isbn:
        abort(404)

    urlbase64 = urlbase64 if len(urlbase64)%4 == 0 else "{}{}".format(urlbase64,'='*(4-len(urlbase64)%4))
    url = base64.decodestring(urlbase64)
    url = unicode(url)
    url_d = ''
    for id, one_char in enumerate(url):
        if id % 2 == 1:
            url_d += one_char

    bucket_name = 'bookist'
    key = '{}.jpg'.format(isbn)
    ret, info = b.fetch(url_d, bucket_name, key)

    print ret
    print info
    return 'done'




