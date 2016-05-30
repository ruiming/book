# -*- coding: utf-8 -*-

from app import db

from time import time
from app.auth.model import User


class Tag(db.Document):
    name = db.StringField(required=True, unique=True)
    belong = db.StringField()

    def __unicode__(self):
        return u'{}'.format(self.name)


class BookTag(db.EmbeddedDocument):
    name = db.StringField(required=True)

    def __unicode__(self):
        return u'{}'.format(self.name)


class Book(db.Document):
    title = db.StringField()
    isbn = db.StringField(required=True)
    title = db.StringField(required=True)
    origin_title = db.StringField()
    subtitle = db.StringField()
    author = db.ListField(db.StringField())
    translator = db.ListField(db.StringField())
    create_time = db.IntField(default=int(time()), required=True)
    publish_time = db.StringField()
    image = db.StringField(required=True)
    page = db.IntField()
    catelog = db.StringField()
    price = db.DecimalField()
    publisher = db.StringField()
    description = db.StringField()
    author_description = db.StringField()
    tag = db.ListField(db.EmbeddedDocumentField(BookTag))
    binding = db.StringField()
    rate = db.FloatField()
    reason = db.StringField()

    class NotBookInstance(Exception):
        pass

    def __unicode__(self):
        return u'《{}》'.format(self.title)


class BookList(db.Document):

    title = db.StringField(required=True)
    subtitle = db.StringField()
    description = db.StringField()
    author = db.ReferenceField(User)
    tag = db.ListField(db.ReferenceField(Tag))
    books = db.ListField(db.ReferenceField(Book))
    hot = db.IntField(default=0)
    image = db.StringField()
    collect = db.IntField(default=0, required=True)
    create_time = db.IntField(default=int(time()), required=True)
    last_edit_time = db.IntField(default=int(time()), required=True)

    class NotBookListInstance(Exception):
        pass


class Activity(db.Document):
    """
    首页活动模型
    """
    image = db.StringField(required=True)
    title = db.StringField()
    url = db.StringField()
    enabled = db.BooleanField(required=True, default=True)
    start_time = db.IntField(default=int(time()), required=True)
    end_time = db.IntField(required=False)


class Applacation(db.Document):
    """
    API调用者信息
    """
    name = db.StringField(required=True)
    key = db.StringField(required=True, unique=True)
    secret_key = db.StringField(required=True)

    status = db.IntField(required=True, default=1)
