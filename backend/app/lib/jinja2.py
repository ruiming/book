# coding:utf-8
import time


def jinja2_filter_datetime(date, fmt=None):
    format = fmt or '%Y-%m-%d %H:%M:%S'
    value = time.localtime(date)
    dt = time.strftime(format, value)
    return dt