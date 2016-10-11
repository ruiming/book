# -*- coding: utf-8 -*-
from flask import Flask
from flask_mongoengine import MongoEngine
from flask_admin import Admin
from flask_security import Security, MongoEngineUserDatastore
from wechatpy.oauth import WeChatOAuth
from qiniu import Auth, BucketManager
from flask_restful import Api

app = Flask(__name__)
app.config.from_object('config')

db = MongoEngine(app)

wechat = WeChatOAuth(app.config['CORP_ID'], app.config['SECRET'], "http://www.bookist.org/code2token", scope='snsapi_userinfo', state='55555')

q = Auth(app.config['QINIU_ACCESS_KEY'], app.config['QINIU_SECRET_KEY'])
b = BucketManager(q)

api = Api(app)

# Later on you'll import the other blueprints the same way:
# from app.comments.views import mod as commentsModule
# from app.posts.views import mod as postsModule
# app.register_blueprint(commentsModule)
# app.register_blueprint(postsModule)

from app.views import auth_module
app.register_blueprint(auth_module)


# Flask-Admin

from app.lib.admin_base import AdminBaseModelView

from app.admin_views import *
from app.models import *

admin = Admin(app, template_mode='bootstrap3-full', name=u'Bookist.org 后台', index_view=AdminView(endpoint="admin"))

admin.add_view(BookListView(BookList, name=u'书单管理', category=u"书单相关"))
admin.add_view(ActivityView(Activity, name=u'活动管理'))
admin.add_view(BookView(Book, name=u'书籍管理'))
admin.add_view(TagView(Tag, name=u'书单标签', category=u"书单相关"))
admin.add_view(UserView(User, name=u'用户管理', category=u"用户相关"))
admin.add_view(AdminBaseModelView(UserRole, name=u'用户组', category=u"用户相关"))
admin.add_view(AdminBaseModelView(Comment, name=u"评论", category=u"用户相关"))
admin.add_view(AdminBaseModelView(Points, name=u"积分", category=u"用户相关"))
admin.add_view(PendingBillingView(name=u"待发货订单"))
admin.add_view(WaitingBillingView(name=u"待收货订单"))
admin.add_view(AfterSellingBillingView(name=u"售后订单"))
admin.add_view(AdminBaseModelView(Collect, name=u"收藏", category=u"用户相关"))
admin.add_view(AdminBaseModelView(Notice, name=u"通知", category=u"用户相关"))
admin.add_view(AdminBaseModelView(Feedback, name=u"反馈信息"))
admin.add_view(StoreHouseView(name=u"退换书籍处理"))


# Flask-Security

user_datastore = MongoEngineUserDatastore(db, User, UserRole)
security = Security(app, user_datastore)


# Jinja2 Filter
from app.lib.jinja2_function import jinja2_filter_datetime
app.add_template_filter(jinja2_filter_datetime, name='datetime')


# Flask-RestFul
from app.resources import *

# Slide
api.add_resource(SlidesResource, '/slides')
api.add_resource(SlideResource, '/slides/<activity_id>')

# Book
api.add_resource(BooksResource, '/books/<books_type>')
api.add_resource(BookResource, '/book/<isbn>')
api.add_resource(SimilarBooksResource, '/book/<isbn>/similar')
api.add_resource(BookCollectResource, '/book/<isbn>/collect')
api.add_resource(BookCommentsResource, '/book/<isbn>/comments')
api.add_resource(BookCommentResource, '/comments/<comment_id>')

# Book List
api.add_resource(BookListsResource, '/booklists')
api.add_resource(BookListResource, '/booklists/<book_list_id>')
api.add_resource(BookListLoveResource, '/booklists/<book_list_id>/love')
api.add_resource(BookListCollectResource, '/booklists/<book_list_id>/collect')
api.add_resource(BookListCommentsResource, '/booklists/<book_list_id>/comments')
api.add_resource(BookListCommentResource, '/booklistcomment/<comment_id>')

# Cart
api.add_resource(CartsResource, '/carts')

# Billing
api.add_resource(BillingsResource, '/billings')
api.add_resource(BillingResource, '/billings/<billing_id>')
api.add_resource(BillingScoreResource, '/billings/<billing_id>/score')
api.add_resource(AfterSellBillingResource, '/billings/<billing_id>/afterselling')
api.add_resource(SingleAfterSellBillingResource, '/billings/<billing_id>/afterselling/<afterselling_id>')
api.add_resource(AfterSellBillingsResource, '/afterselling')

# User
api.add_resource(UserResource, '/user')

api.add_resource(UserPhoneCaptchaResource, '/user/captcha')
api.add_resource(UserTokenResource, '/user/token')
api.add_resource(UserAvatarResource, '/user/avatar')

api.add_resource(UserAddressListResource, '/user/addresses')
api.add_resource(UserAddressResource, '/user/addresses/<address_id>')

api.add_resource(UserNoticesResource, '/user/notices')
api.add_resource(UserNoticeResource, '/user/notices/<notice_id>')

api.add_resource(UserCollectsResource, '/user/collects/<collect_type>')

api.add_resource(UserPointsResource, '/user/points')

api.add_resource(UserCommentsResource, '/user/comments')

# Other
api.add_resource(TagResource, '/tags')
api.add_resource(FeedbackResource, '/feedback')
