# -*- coding: utf-8 -*-

from time import time
from app import b


def time_int():
    return int(time())


def save_image(url, key):
    """
    保存图片至七牛
    :param url:
    :param key:
    :return:
    """
    url_splits = url.split('.')

    file_type = url_splits[len(url_splits)-1:][0]
    print url
    print file_type
    bucket_name = 'bookist'
    save_name = 'images/{}.{}'.format(key, file_type)
    print save_name
    ret, info = b.fetch(url, bucket_name, save_name)
    return save_name