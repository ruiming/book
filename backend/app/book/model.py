# -*- coding: utf-8 -*-

from app import db, app

from app.auth.model import User
from app.lib import save_image, time_int


class CDNImage(db.EmbeddedDocument):
    url = db.StringField(required=True)
    is_cdn = db.BooleanField(default=False)

    def __str__(self):
        return self.get_full_url()

    def __unicode__(self):
        return self.get_full_url()

    def get_full_url(self):
        if self.is_cdn:
            return '{}/{}'.format(app.config['IMAGE_CDN_BASE_URL'], self.url)
        else:
            if self.url[:4] == 'http':
                return self.url
            else:
                return '/statics/{}'.format(self.url)


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
    isbn = db.StringField(required=True, unique=True, primary_key=True)
    title = db.StringField(required=True)
    origin_title = db.StringField()
    subtitle = db.StringField()
    author = db.ListField(db.StringField())
    translator = db.ListField(db.StringField())
    create_time = db.IntField(default=time_int, required=True)
    publish_time = db.StringField()
    image = db.EmbeddedDocumentField(CDNImage, required=True)
    page = db.IntField()
    catelog = db.StringField()
    price = db.DecimalField()
    publisher = db.StringField()
    description = db.StringField()
    author_description = db.StringField()
    tag = db.ListField(db.EmbeddedDocumentField(BookTag))
    binding = db.StringField()
    rate = db.FloatField()
    reason = db.StringField(require=True)

    enabled = db.BooleanField(default=True)

    class NotBookInstance(Exception):
        pass

    def __unicode__(self):
        return u'《{}》'.format(self.title)

    def save(self):
        self = super(Book, self).save()
        if not self.image.is_cdn:
            image_url = save_image(self.image.url, str(self.pk))
            self.image.url = image_url
            self.image.is_cdn = True
            self.save()
        return self


class BookList(db.Document):

    title = db.StringField(required=True)
    subtitle = db.StringField()
    description = db.StringField(required=True)
    author = db.ReferenceField(User, required=True)
    tag = db.ListField(db.ReferenceField(Tag))
    books = db.ListField(db.ReferenceField(Book), required=True)
    hot = db.IntField(default=0)
    image = db.EmbeddedDocumentField(CDNImage, required=True)
    collect = db.IntField(default=0, required=True)
    create_time = db.IntField(default=time_int, required=True)
    last_edit_time = db.IntField(default=time_int, required=True)

    class NotBookListInstance(Exception):
        pass

    def save(self):
        self = super(BookList, self).save()
        if not self.image.is_cdn:
            image_url = save_image(self.image.url, str(self.pk))
            self.image.url = image_url
            self.image.is_cdn = True
            self.save()
        return self


class Activity(db.Document):
    """
    首页活动模型
    """
    image = db.EmbeddedDocumentField(CDNImage, required=True)
    title = db.StringField()
    url = db.StringField()
    enabled = db.BooleanField(required=True, default=True)
    start_time = db.IntField(default=time_int, required=True)
    end_time = db.IntField(required=False)

    def save(self):
        self = super(Activity, self).save()
        if not self.image.is_cdn:
            image_url = save_image(self.image.url, str(self.pk))
            self.image.url = image_url
            self.image.is_cdn = True
            self.save()
        return self


class Applacation(db.Document):
    """
    API调用者信息
    """
    name = db.StringField(required=True)
    key = db.StringField(required=True, unique=True)
    secret_key = db.StringField(required=True)

    status = db.IntField(required=True, default=1)
