# -*- coding: utf-8 -*-
import os

_basedir = os.path.abspath(os.path.dirname(__file__))


DEBUG = True

# TODO: change the SECRET_KEY when the web is built
SECRET_KEY = '123456'


# Mongodb Setting / MongoEngine
MONGODB_DB = os.environ.get('MONGODB_DB', 'book')
MONGODB_HOST = os.environ.get('MONGODB_HOST', '127.0.0.1')
MONGODB_PORT = os.environ.get('MONGODB_PORT', 27017)
MONGODB_USERNAME = os.environ.get('MONGODB_USERNAME', '')
MONGODB_PASSWORD = os.environ.get('MONGODB_PASSWORD', '')


# Celery Setting
CELERY_BROKER_URL = 'mongodb://localhost:27017/celery'
CELERY_RESULT_BACKEND = 'mongodb://localhost:27017/celery'
CELERY_TASK_SERIALIZER = 'json'

# CSRF
CSRF_ENABLED = True
CSRF_SESSION_KEY = SECRET_KEY

# WECHAT SETTING
CORP_ID = os.environ.get('WECHAT_CORP_ID', 'wx83be5ba2bc5d468f')
SECRET = os.environ.get('WECHAT_SECRET', 'ae9586ca3821b6f3f1ceb2a760857a9d')
TOKEN = os.environ.get('WECHAT_TOKEN', '123456')


# QINIU
QINIU_ACCESS_KEY = os.environ.get('QINIU_ACCESS_KEY', 'rIku3cj75WrKEprUEf2YPDto8aPVDUe8iQ3Al2Q1')
QINIU_SECRET_KEY = os.environ.get('QINIU_SECRET_KEY', 'x5nPZqGt6lYBoKY1XVMEjY70VPCWRljmbaPtK4SJ')


# Flask-Security
SECURITY_PASSWORD_HASH = 'pbkdf2_sha512'
SECURITY_PASSWORD_SALT = 'some key'