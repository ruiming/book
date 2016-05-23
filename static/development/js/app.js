var routeApp = angular.module('index',['ui.router','ui.bootstrap','ngAnimate','ngSanitize','ngTouch','infinite-scroll']);

routeApp.config(['$stateProvider','$locationProvider','$httpProvider', '$urlRouterProvider',function ($stateProvider,$locationProvider,$httpProvider,$urlRouterProvider) {

    // modify response from transformResponse and alert error
    $httpProvider.defaults.transformResponse.push(function (response) {
        if(typeof(response.data) != "undefined" && response.status == "success") {
            response = response.data;
            return response;
        }
        if(response.status == "error") {
            // todo change to alert when product
            console.log("----------------Error----------------: " + response.message);
            return;
        }
        return response;
    });

    $httpProvider.defaults.useXDomain = true;
    delete $httpProvider.defaults.headers.common['X-Requested-With'];

    // push timestampMaker into httpProvider
    $httpProvider.interceptors.push('timestampMarker');

    $httpProvider.interceptors.push('tokenInjector');

    $httpProvider.defaults.transformRequest = function(obj){
        var str = [];
        for(var p in obj){
            str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
        }
        return str.join("&");
    };
    $httpProvider.defaults.headers.post = {'Content-Type': 'application/x-www-form-urlencoded'};
    $httpProvider.defaults.headers.put = {'Content-Type': 'application/x-www-form-urlencoded'};
    $httpProvider.defaults.headers.delete = {'Content-Type': 'application/x-www-form-urlencoded'};

    $locationProvider.html5Mode(true);
    
    // redirect to "/" if not match
    $urlRouterProvider.otherwise("/");

    // routes
    $stateProvider
        .state('index', {
            url: '/',
            views: {
                'main': {
                    templateUrl: 'index/index_tpl.html',
                    controller: 'IndexCtrl'
                },
                'nav': {
                    templateUrl: 'navbar/navbar_tpl.html'
                }
            }
        })
        .state('recommend',{
            url: '/books/recommend',
            views: {
                'main': {
                    controller: 'RecommendMoreCtrl',
                    templateUrl: 'recommend_more/recommend_more_tpl.html'
                },
                'nav': {
                    templateUrl: 'navbar/navbar_tpl.html'
                }
            }
        })
        .state('booklists',{
            url: '/booklists',
            views: {
                'main': {
                    controller: 'BooklistsCtrl',
                    templateUrl: 'booklists/booklists_tpl.html'
                },
                'nav': {
                    templateUrl: 'navbar/navbar_tpl.html'
                }
            }
        })
        .state('popular',{
            url: '/booklists/popular',
            views: {
                'main': {
                    controller: 'PopularMoreCtrl',
                    templateUrl: 'popular_more/popular_more_tpl.html'
                },
                'nav': {
                    templateUrl: 'navbar/navbar_tpl.html'
                }
            }
        })
        .state('book',{
            url: '/book/{isbn}',
            views: {
                'main': {
                    controller: 'BookCtrl',
                    templateUrl: 'book/book_tpl.html'
                },
                'nav': {
                    templateUrl: 'navbar/navbar_tpl.html'
                }
            }
        })
        .state('bookDetail',{
            url: '/book/{isbn}/detail',
            views: {
                'main': {
                    controller: 'BookInfoCtrl',
                    templateUrl: 'book_info/book_info_tpl.html'
                },
                'nav': {
                    templateUrl: 'navbar/navbar_tpl.html'
                }
            }
        })
        .state('booklist',{
            url: '/booklist/{id}',
            views: {
                'main': {
                    controller: 'BookListCtrl',
                    templateUrl: 'booklist/booklist_tpl.html'
                },
                'nav': {
                    templateUrl: 'navbar/navbar_tpl.html'
                }
            }
        })
        .state('tagBooklists',{
            url: '/booklists/{tag}',
            views: {
                'main': {
                    controller: 'TagBooklistsCtrl',
                    templateUrl: 'tag-booklists/tag-booklists_tpl.html'
                },
                'nav': {
                    templateUrl: 'navbar/navbar_tpl.html'
                }
            }
        })
        .state('commentsBook',{
            url: '/comments/{isbn}',
            views: {
                'main': {
                    controller: 'CommentsCtrl',
                    templateUrl: 'comments/comments_tpl.html'
                },
                'nav': {
                    templateUrl: 'navbar/navbar_tpl.html'
                }
            }
        })
        .state('tags',{
            url: '/tags',
            views: {
                'main': {
                    controller: 'TagsCtrl',
                    templateUrl: 'tags/tags_tpl.html'
                },
                'nav': {
                    templateUrl: 'navbar/navbar_tpl.html'
                }
            }
        })
        .state('me',{
            url: '/me',
            views: {
                'main': {
                    controller: 'MeCtrl',
                    templateUrl: 'me/me_tpl.html'
                },
                'nav': {
                    templateUrl: 'navbar/navbar_tpl.html'
                }
            }
        })
        .state('cart',{
            url: '/cart',
            views: {
                'main': {
                    controller: 'CartCtrl',
                    templateUrl: 'cart/cart_tpl.html'
                },
                'nav': {
                    templateUrl: 'navbar/navbar_tpl.html'
                }
            }
        })
        .state('orders',{
            url: '/orders/{status}/show',
            views: {
                'main': {
                    controller: 'OrdersCtrl',
                    templateUrl: 'orders/orders_tpl.html'
                },
                'nav': {
                    templateUrl: 'navbar/navbar_tpl.html'
                }
            }
        })
        .state('orderDetail',{
            url: '/order/{id}/detail',
            views: {
                'main': {
                    controller: 'OrderDetailCtrl',
                    templateUrl: 'order_detail/order_detail_tpl.html'
                }
            }
        })
        .state('orderComments',{
            url: '/order/{id}/comments',
            views: {
                'main': {
                    controller: 'OrderCommentsCtrl',
                    templateUrl: 'order_comments/order_comments_tpl.html'
                }
            }
        })
        .state('ordersCommented', {
            url: '/orders/commented',
            views: {
                'main': {
                    controller: 'OrdersCommentedCtrl',
                    templateUrl: 'orders_commented/orders_commented_tpl.html'
                },
                'nav': {
                    templateUrl: 'navbar/navbar_tpl.html'
                }
            }
        })
        .state('comments',{
            url: '/comments',
            views: {
                'main': {
                    controller: 'UserCommentsCtrl',
                    templateUrl: 'user_comments/user_comments_tpl.html'
                },
                'nav': {
                    templateUrl: 'navbar/navbar_tpl.html'
                }
            }
        })
        .state('booklistsCollect',{
            url: '/collect/booklists',
            views: {
                'main': {
                    controller: 'CollectBookListsCtrl',
                    templateUrl: 'collect_booklists/collect_booklists_tpl.html'
                },
                'nav': {
                    templateUrl: 'navbar/navbar_tpl.html'
                }
            }
        })
        .state('booksCollect',{
            url: '/collect/books',
            views: {
                'main': {
                    controller: 'CollectBooksCtrl',
                    templateUrl: 'collect_books/collect_books_tpl.html'
                },
                'nav': {
                    templateUrl: 'navbar/navbar_tpl.html'
                }
            }
        })
        .state('point', {
            url: '/point',
            views: {
                'main': {
                    controller: 'PointCtrl',
                    templateUrl: 'point/point_tpl.html'
                },
                'nav': {
                    templateUrl: 'navbar/navbar_tpl.html'
                }
            }
        })
        .state('notices',{
            url: '/notices',
            views: {
                'main': {
                    controller: 'NoticesCtrl',
                    templateUrl: 'notices/notices_tpl.html'
                },
                'nav': {
                    templateUrl: 'navbar/navbar_tpl.html'
                }
            }
        })
        .state('settings', {
            url: '/settings',
            views: {
                'main': {
                    controller: 'SettingsCtrl',
                    templateUrl: 'settings/settings_tpl.html'
                },
                'nav': {
                    templateUrl: 'navbar/navbar_tpl.html'
                }
            }
        })
        .state('signature', {
            url: '/setting/signature/{signature}',
            views: {
                'main': {
                    controller: 'SignatureCtrl',
                    templateUrl: 'setting_signature/setting_signature_tpl.html'
                },
                'nav': {
                    templateUrl: 'navbar/navbar_tpl.html'
                }
            }
        })
        .state('address', {
            url: '/setting/address',
            views: {
                'main': {
                    controller: 'AddressCtrl',
                    templateUrl: 'setting_address/setting_address_tpl.html'
                },
                'nav': {
                    templateUrl: 'navbar/navbar_tpl.html'
                }
            }
        })
        .state('AddressAdd', {
            url: '/setting/address/add',
            views: {
                'main': {
                    controller: 'AddressAddCtrl',
                    templateUrl: 'setting_address_add/setting_address_add_tpl.html'
                },
                'nav': {
                    templateUrl: 'navbar/navbar_tpl.html'
                }
            }
        })
        .state('cart2order', {
            url: '/cart2order',
            views: {
                'main': {
                    controller: 'Cart2OrderCtrl',
                    templateUrl: 'cart2order/cart2order_tpl.html'
                }
            }
        })
        .state('suggest', {
            url: '/suggest',
            views: {
                'main': {
                    controller: 'SuggestCtrl',
                    templateUrl: 'suggest/suggest_tpl.html'
                },
                'nav': {
                    templateUrl: 'navbar/navbar_tpl.html'
                }
            }
        });
}]);


/*
 * 配置文件
 */

var delay = 2800;                           // time delay for message animate
var host = "http://www.bookist.org";        // API url
// var host = "http://192.168.1.231";

var statusDict = {                       // 订单状态转换
    "create": "创建",                    // 订单创建，等同于待发货
    "pending": "待发货",                 // 订单创建后就处于待发货状态，用户可以取消订单
    "waiting": "待收货",                 // 订单已发货，待用户收货，不能取消订单
    "commenting": "待评价",              // 用户确认收货，进入待评价状态，用户可以申请售后
    "done": "已完成",                    // 用户评价完毕，已完成状态，用户可以申请售后
    "canceled": "已取消",                // 用户取消订单，订单终止
    "refund": "申请退款中",              // 用户申请退款
    "refunding": "退款中",               // 退款已受理
    "refunded": "退款完成",              // 退款完成，订单终止
    "replace": "申请换货中",             // 用户申请换货
    "replacing": "换货中",               // 换货已受理
    "replaced": "换货完成",              // 换货完成，根据用户是否评价订单，进入待评价状态或者已完成状态，用户可以再次申请售后
    "refund_refused": "退款失败",        // 不满足退款条件，比如书籍人为破损，[退款中]状态时，工作人员检查不满足退款条件进入该状态
    "replace_refused": "换货失败",       // 同上
    "closed": "已关闭"                   // 因某些原因被关闭的订单
};
/* 状态流程
 *                                                            -> refund_refused
 *                                                            -> closed    -> refund_refused
 *                                          ->  ->  -> refund -> refunding -> refunded
 * create(pending) -> waiting -> commenting -> done ->
 *                 -> canceled              ->  ->  -> replace -> replacing -> replaced(commenting/done) -> ...
 *                                                             -> closed    -> replace_refused
 *                                                             -> replaced_refused
 */

/*
 * 积分机制
 * 初次登陆:            100分        所有用户第一次登陆默认获取
 * 第一次下单购买:        50分        仅限第一单，且订单完成不包含退款才计入
 * 购买一本图书：         10分        按本计，每本记一次
 * 评价一本图书：        2/5分        购买后评价5分，未购买评价2分
 * 评价获置顶:           20分         人工置顶，自动发消息通知并加分
 * 系统奖励:             xx分         提供接口，推送消息通知并发放奖励
 */

/*
 * 错误码 todo
 */
routeApp.directive('currentTime', ["$timeout", "dateFilter", function($timeout, dateFilter) {
// 实时显示指定规格化的时间
    return {
        scope: {
            format: '@',    // 规格化时间
            real: '@'       // 是否动态显示
        },
        link: function(scope, element){
            var timeoutId;

            function updateTime(){
                element.text(dateFilter(new Date(), scope.format));
            }

            if (scope.real == "true" || scope.real){
                function updateLater() {
                    timeoutId = $timeout(function () {
                        updateTime();
                        updateLater();
                    }, 1000);
                }

                element.bind('$destroy', function () {
                    $timeout.cancel(timeoutId);
                });

                updateLater();
            }

            else{
                updateTime();
            }
        }
    };
}]);
routeApp.directive('focusMe', ["$timeout", function($timeout) {
    return {
        scope: { trigger: '@focusMe' },
        link: function(scope, element) {
            scope.$watch('trigger', function(value) {
                if(value === "true") {
                    $timeout(function() {
                        element[0].focus();
                    });
                }
            });
        }
    };
}]);
routeApp.directive('navbar', function(){
   return {
       restrict: 'AE',  //推荐使用A
       replace: true,   //template会覆盖掉自定义标签
       templateUrl: 'navbar/navbar_tpl.html'
   };
});
routeApp.directive('loading', function(){
    return {
        restrict: 'AE',
        replace: true,
        template: '<div class="cssload-thecube"><div class="cssload-cube cssload-c1"></div><div class="cssload-cube cssload-c2"></div><div class="cssload-cube cssload-c4"></div><div class="cssload-cube cssload-c3"></div></div>'
    };
});
routeApp.directive('wait', function(){
   return {
       restrict: 'AE',
       replace: true,
       template: '<div id="circularG"><div id="circularG_1" class="circularG"></div><div id="circularG_2" class="circularG"></div><div id="circularG_3" class="circularG"></div><div id="circularG_4" class="circularG"></div><div id="circularG_5" class="circularG"></div><div id="circularG_6" class="circularG"></div><div id="circularG_7" class="circularG"></div><div id="circularG_8" class="circularG"></div></div>'
   };
});
routeApp.directive('myMaxlength', function() {
    return {
        require: 'ngModel',
        link: function (scope, element, attrs, ngModelCtrl) {
            var maxlength = Number(attrs.myMaxlength);
            function fromUser(text) {
                if (text.length > maxlength) {
                    var transformedInput = text.substring(0, maxlength);
                    ngModelCtrl.$setViewValue(transformedInput);
                    ngModelCtrl.$render();
                    return transformedInput;
                }
                return text;
            }
            ngModelCtrl.$parsers.push(fromUser);
        }
    };
});
routeApp.factory('BL', ["$http", function($http){
    var BL = function(url,params){
        this.list = [];
        this.busy = false;
        this.url = url;
        this.params = params;
        this.continue = true;      // 是否继续
    };
    BL.prototype.nextPage = function(){
        if(!this.continue){
            this.busy = false;
            return;
        }
        if(this.busy) {
            return;
        }
        this.busy = true;
        $http({
            method: 'GET',
            url: this.url,
            params: this.params
        }).success(function(response){
            var list = response;
            if(list.length < 5 ) {
                this.continue = false;
            }
            for (var i = 0 ;i < list.length; i++){
                list[i].star = Math.ceil(list[i].rate/2);
                this.list.push(list[i]);
            }
            this.busy = false;
            this.params.page += 1;
        }.bind(this));
    };
    return BL;
}]);
routeApp.factory('TEMP', function(){
    var _list = [];
    var _dict = {};
    return {
        pushList: function(list){
            _list.push(list);
        },
        setList: function(list){
            _list = list;
        },
        getList: function(){
            return _list;
        },
        setDict: function(dict){
            _dict = dict;
        },
        getDict: function(){
            return _dict;
        }
    };
});
routeApp.factory('User', function () {

    var _signature = '';
    var _temp = {};

    return {
        getSignature: function() {
            return _signature;
        },
        getTemp: function() {
            return _temp;
        },
        setSignature: function(signature) {
            _signature = signature;
        },
        setTemp: function(temp) {
            _temp = temp;
        }
    };
});
routeApp.factory('timestampMarker', [function() {
    var timestampMarker = {
        request: function(config) {
            config.requestTimestamp = new Date().getTime();
            return config;
        },
        response: function(response) {
            response.config.responseTimestamp = new Date().getTime();
            return response;
        }
    };
    return timestampMarker;
}]);
routeApp.factory('tokenInjector', ['$injector','$q', '$location', function($injector,$q){
    var tokenInjector = {
        request: function(config){

            var url = host + '/auth_verify';
            var deferred = $q.defer();
            var http = $injector.get('$http');
            if(config.url === url)
                return config;

            if(sessionStorage.verify === "true") {
                var timestamp = new Date().getTime() / 1000;
                // 时间超过7000s，需要重新验证
                if (timestamp - localStorage.getItem("createdtime") >= 7000){
                    sessionStorage.verify = false;
                }
                config.headers['token'] = localStorage.getItem("token");
                config.headers['userid'] = localStorage.getItem("user_id");
                deferred.resolve(config);
            }
            else {
                // 验证token
                http({
                    method: 'GET',
                    url: url,
                    params: {
                        token: localStorage.getItem("token"),
                        user_id: localStorage.getItem("user_id")
                    }
                }).success(function(response){
                    localStorage.setItem("token", response.token);
                    localStorage.setItem("createdtime", response.time);
                    sessionStorage.verify = "true";
                    config.headers['token'] = localStorage.getItem("token");
                    config.headers['userid'] = localStorage.getItem("user_id");
                    console.log("verify OK");
                    deferred.resolve(config);
                }).error(function(){
                    // 跳转微信登陆
                    console.log("verify FAIL");
                    // window.location.replace(host);
                    deferred.resolve(config);
                });
            }
            return deferred.promise;
        }
    };
    return tokenInjector;
}]);
routeApp.filter('nl2br', ['$sanitize', function($sanitize) {
    var tag = (/xhtml/i).test(document.doctype) ? '<br />' : '<br>';
    return function(msg) {
        // ngSanitize's linky filter changes \r and \n to &#10; and &#13; respectively
        msg = (msg + '').replace(/(\r\n|\n\r|\r|\n|&#10;&#13;|&#13;&#10;|&#10;|&#13;)/g, tag + '$1');
        return $sanitize(msg);
    };
}]);
routeApp.controller('BookListCtrl',["$scope", "$http", "$stateParams", function($scope, $http, $stateParams) {
    $scope.busy = true;
    $scope.wait = false;
    $scope.wait1 = false;       // 收藏书单延迟
    $scope.wait2 = false;       // 取消收藏书单延迟

    // 获取书单信息
    $http({
        method: 'GET',
        url: host + '/booklist',
        params: {
            id: $stateParams.id
        }
    }).success(function(response){
        $scope.booklist = response;
        for(var i in $scope.booklist.books){
            if($scope.booklist.books.hasOwnProperty(i)){
                $scope.booklist.books[i].star = Math.ceil($scope.booklist.books[i].rate/2);
            }
        }
        $scope.busy = false;
    });

    // 收藏书单函数
    $scope.collect = function(){
        $scope.wait = true;
        $http({
            method: 'POST',
            url: host + '/collect',
            data: {
                type: "booklist",
                id: $stateParams.id
            }
        }).success(function(){
            $scope.booklist.collect_already = !$scope.booklist.collect_already;
            if($scope.booklist.collect_already)  {
                $scope.booklist.collect++;
                $scope.wait1 = true;
            }
            else  {
                $scope.booklist.collect--;
                $scope.wait2 = true;
            }
            $scope.wait = false;
            window.setTimeout(function() {
                $scope.$apply(function() {
                    $scope.wait1 = false;
                    $scope.wait2 = false;
                });
            }, delay);
        });
    };
}]);

routeApp.controller('BooklistsCtrl',["$scope", "$http", "BL", function($scope, $http, BL) {
    var url = host + '/booklist';
    var params = {
        type: "all",
        page: 1
    };

    // 获取书单,获取默认排序的十个书单
    $scope.booklists = new BL(url,params);

    // 获取热门书单标签并缓存
    if(sessionStorage.tags != undefined) {
        $scope.tags = angular.fromJson(sessionStorage.tags);
    }
    else {
        $http({
            method: 'GET',
            url: host + '/tags',
            params: {
                type: "hot"
            }
        }).success(function(response){
            $scope.tags = response;
            sessionStorage.tags = angular.toJson($scope.tags);
        });
    }

    // 时间优先
    $scope.timeOrder = function(){
        var url = host + '/booklist';
        var params = {
            type: "time",
            page: 1
        };
        $scope.booklists = new BL(url,params);
        $scope.booklists.nextPage();
    };

    // 收藏优先
    $scope.collectOrder = function(){
        var url = host + '/booklist';
        var params = {
            type: "collect",
            page: 1
        };
        $scope.booklists = new BL(url, params);
        $scope.booklists.nextPage();
    };
}]);

routeApp.controller('CartCtrl',["$scope", "$http", "$state", "TEMP", function($scope, $http, $state, TEMP) {
    $scope.price = 0;
    $scope.busy = true;
    $scope.checked = false;         // 默认全选
    $scope.status = "";             // 默认不激活
    $scope.editStatu = false;       // 默认非编辑状态
    $scope.count = 0;               // 书籍数量(单本数量可叠加，结算显示)
    $scope.number = 0;              // 书籍种类(单本数量不叠加，移入收藏和删除显示)
    $scope.checkArr = [];           // 暂存勾选状态
    TEMP.setList([]);

    // 获取购物车
    $http({
        method: 'GET',
        url: host + '/user_carts'
    }).success(function(response){
        $scope.items = response;
        $scope.busy = false;
        for(var i in $scope.items) {
            if($scope.items.hasOwnProperty(i)){
                $scope.items[i].checked = false;
                $scope.items[i].index = i;
                $scope.items[i]._index = i;     // 替代$index便于删除操作
                $scope.items[i].status = "";
            }
        }
        $scope.recount($scope.items);
    });

    // 重新计算价格和页面的各种状态
    $scope.recount = function(){
        $scope.price = 0;
        $scope.count = 0;
        $scope.status = "active";
        $scope.checked = true;
        $scope.number = 0;
        for(var i in $scope.items){
            if($scope.items.hasOwnProperty(i)){
                $scope.price += $scope.items[i].price*$scope.items[i].number*$scope.items[i].checked;
                $scope.count += $scope.items[i].number*$scope.items[i].checked;
                if(!$scope.items[i].checked) {
                    $scope.checked = false;
                    $scope.status = "";
                }
                else {
                    $scope.number ++ ;
                }
            }
        }
        if($scope.items.length == 0){
            $scope.message = true;
        }
    };

    // 全选/全不选
    $scope.selectAll = function(){
        if($scope.status == "active") {
            $scope.status = "";
            $scope.checked = false;
            for(var i in $scope.items){
                if($scope.items.hasOwnProperty(i)){
                    $scope.items[i].checked = false;
                    $scope.items[i].status = "";
                }
            }
            $scope.recount();
        }
        else {
            $scope.status = "active";
            $scope.checked = true;
            for(var j in $scope.items){
                if($scope.items.hasOwnProperty(j)){
                    $scope.items[j].checked = true;
                    $scope.items[j].status = "active";
                }
            }
            $scope.recount();
        }
    };

    // 添加书籍数量
    $scope.plus = function(item) {
        if(item.number < 10) {
            item.number ++;
            $scope.recount();
        }
    };

    // 减少书籍数量
    $scope.minus = function(item) {
        if(item.number > 1) {
            item.number --;
            $scope.recount();
        }
    };

    // 编辑
    $scope.edit = function() {
        for(var i in $scope.items){
            if($scope.items.hasOwnProperty(i)){
                $scope.checkArr[i] = $scope.items[i].checked;
                $scope.items[i].checked = false;
                $scope.items[i].status = "";
            }
        }
        $scope.recount();
        $scope.editStatu = true;
    };

    // 完成编辑
    $scope.editOk = function() {
        for(var i in $scope.items){
            if($scope.items.hasOwnProperty(i)){
                $scope.items[i].checked = $scope.checkArr[i];
                if($scope.items[i].checked)    {
                    $scope.items[i].status = "active";
                }
                else {
                    $scope.items[i].status = "";
                }
            }
        }
        $scope.recount();
        $scope.editStatu = false;
    };

    // 购物车选中
    $scope.select = function(status){
        if(status == "active") {
            this.item.status = "";
            this.item.checked = false;
            $scope.recount($scope.items);
        }
        else {
            this.item.status = "active";
            this.item.checked = true;
            $scope.recount($scope.items);
        }
    };

    // 删除多本选中书籍
    $scope.delete = function() {
        for(var i in $scope.items) {
            if($scope.items.hasOwnProperty(i) && $scope.items[i].checked){
                $scope.removeBook($scope.items[i]);
                for(var j = i+1; j<$scope.items.length; j++) {
                    $scope.items[j]._index --;
                }
            }
        }
        $scope.recount();
    };

    // 从购物车删除单个书籍
    $scope.removeBook = function(item){
        $http({
            method: 'DELETE',
            url: host + '/cart',
            data: {
                isbn: item.book.isbn
            }
        }).success(function () {
            $scope.items.splice(item._index, 1);
            $scope.checkArr.splice(item.index, 1);
            $scope.recount();
        });
    };

    // 移入多本图书到收藏夹
    $scope.collect = function() {
        for(var i=0; i<$scope.items.length; i++) {
            if($scope.items[i].checked) {
                if(!$scope.items[i].book.is_collection){
                    $scope.collectBook($scope.items[i]);
                }
                $scope.removeBook($scope.items[i]);
                for(var j = i+1; j<$scope.items.length; j++) {
                    $scope.items[j]._index --;
                }
            }
        }
    };

    // 收藏图书
    $scope.collectBook = function(item) {
        $http({
            method: 'POST',
            url: host + '/collect',
            data: {
                isbn: item.book.isbn,
                type: "book"
            }
        });
    };

    // 编辑书籍数量
    $scope.editBook = function(item){
        if(item.number <= 0)   {
            item.number = 1;
        }
        if(item.number > 10)   {
            item.number = 10;
        }
        $http({
            method: 'PUT',
            url: host + '/cart',
            data: {
                "isbn": item.book.isbn,
                "number": item.number
            }
        }).success(function(){
            $scope.recount();
        });
    };

    // 结算
    $scope.cart2order = function() {
        for(var i in $scope.items) {
            if($scope.items.hasOwnProperty(i) && $scope.items[i].checked) {
                TEMP.pushList($scope.items[i]);
            }
        }
        $state.go('cart2order');
    };
    
}]);

routeApp.controller('BookInfoCtrl', ["$http", "$scope", "$stateParams", function($http, $scope, $stateParams){
    $scope.busy = true;
    
    // 获取图书信息(包含评论和标签)
    $http({
        method: 'GET',
        url: host + '/book',
        params: {
            isbn: $stateParams.isbn,
            type: "detail"
        }
    }).success(function(response){
        $scope.book = response;
        $scope.busy = false;
    });
}]);

routeApp.controller('Cart2OrderCtrl', ["$http", "$scope", "TEMP", "$location", function($http, $scope, TEMP, $location){

    $scope.wait = true;            // 确认订单等待
    $scope.no_address = true;      // 地址必须有

    // 从单体获取
    $scope.books = TEMP.getList();
    
    
    $scope.cart_list = "";
    $scope.order = {
        number: 0,
        price: 0
    };

    // 订单处理
    for(var i=0; i<$scope.books.length; i++){
        $scope.order.number += $scope.books[i].number;
        $scope.order.price += $scope.books[i].price * $scope.books[i].number;
        if(i !== $scope.books.length-1){
            $scope.cart_list += $scope.books[i].id + ",";
        }
        else {
            $scope.cart_list += $scope.books[i].id;
        }
    }

    // 获取默认地址
    $http({
        method: 'GET',
        url: host + '/user_address',
        params: {
            type: "default"
        }
    }).success(function(response){
        $scope.x = response[0];
        $scope.no_address = false;
        $scope.wait = false;
    }).error(function(){
        $scope.wait = false;
        $scope.no_address = true;
    });

    // todo提交订单
    $scope.make = function(){
        $scope.wait = true;
        $http({
            method: 'POST',
            url: host + '/billing',
            data: {
                cart_list: $scope.cart_list,
                address_id: $scope.x.id
            }
        }).success(function(response){
            // * 防止后退回到订单生成页面
            $location.path('/order/'+response+'/detail').replace();
            window.setTimeout(function() {
                $scope.$apply(function() {
                    $scope.wait = false;
                });
            }, 500);
        });
    };
}]);
routeApp.controller('CollectBookListsCtrl', ["$http", "$scope", function($http, $scope){

    $scope.busy = true;

    //  获取全部收藏书单
    $http({
        method: 'GET',
        url: host + '/user_collects',
        params: {
            type: "booklist"
        }
    }).success(function(response){
        $scope.booklists = response;
        $scope.busy = false;
    });
}]);

routeApp.controller('CommentsCtrl',["$scope", "$http", "$stateParams", "TEMP", function($scope, $http, $stateParams, TEMP) {

    $scope.busy = true;
    $scope.title = TEMP.getDict().title;

    // 获取该书的评论
    $http({
        method: 'GET',
        url: host + '/comments',
        params: {
            isbn: $stateParams.isbn
        }
    }).success(function(response){
        $scope.comments = response;
        $scope.busy = false;
        for (var i=0; i< response.comments.length; i++){
            $scope.comments[i].star = Math.ceil($scope.comments[i].star/2);
        }
    });

    // 顶
    $scope.up = function(comment){
        $http({
            method: 'PUT',
            url: host + '/comment',
            data: {
                id: comment.id,
                type: "up"
            }
        }).success(function(){
            if(comment.down_already) {
                comment.down--;
            }
            comment.up_already = !comment.up_already;
            comment.down_already = false;
            if(comment.up_already) {
                comment.up++;
            }
            else {
                comment.up--;
            }
        });
    };

    // 踩
    $scope.down = function(comment){
        $http({
            method: 'PUT',
            url: host + '/comment',
            data: {
                id: comment.id,
                type: "down"
            }
        }).success(function(){
            if(comment.up_already) {
                comment.up--;
            }
            comment.down_already = !comment.down_already;
            comment.up_already = false;
            if(comment.down_already)  {
                comment.down++;
            }
            else {
                comment.down--;
            }
        });
    };
    
}]);

routeApp.controller('CollectBooksCtrl', ["$http", "$scope", function($http, $scope){

    $scope.busy = true;

    // 获取全部收藏书籍
    $http({
        method: 'GET',
        url: host + '/user_collects',
        params: {
            type: "book"
        }
    }).success(function(response){
        $scope.books = response;
        for(var i=0;i<$scope.books.length;i++){
            $scope.books[i].star = Math.ceil($scope.books[i].rate/2);
        }
        $scope.busy = false;
    });
    
    // 取消收藏书籍
    $scope.remove = function(book, index){
        $http({
            method: 'POST',
            url: host + '/collect',
            data: {
                isbn: book.isbn,
                type: "book"
            }
        }).success(function(){
            $scope.books.splice(index, 1);
        });
    };
}]);

routeApp.controller('IndexCtrl',["$scope", "$http", function($scope, $http) {

    $scope.myInterval = 5000;
    $scope.noWrapSlides = true;
    $scope.active = 0;

    // 获取书籍推荐
    if(sessionStorage.books != undefined){
        $scope.books = JSON.parse(sessionStorage.books);
    }
    else {
        $http({
            method: 'GET',
            url: host + '/pop_book'
        }).success(function(response){
            $scope.books = response;
            for(var i=0;i<$scope.books.length;i++){
                $scope.books[i].star = Math.ceil($scope.books[i].rate/2);
            }
            sessionStorage.books = JSON.stringify($scope.books);
        });
    }

    // 获取热门书单
    if(sessionStorage.booklists != undefined){
        $scope.booklists = JSON.parse(sessionStorage.booklists);
    }
    else {
        $http({
            method: 'GET',
            url: host + '/booklist',
            params: {
                type: "hot"
            }
        }).success(function(response){
            $scope.booklists = response;
            sessionStorage.booklists = JSON.stringify($scope.booklists);
        });
    }

    // 获取活动轮播
    if(sessionStorage.slides != undefined) {
        $scope.slides = JSON.parse(sessionStorage.slides);
    }
    else {
        $http({
            method: 'GET',
            url: host + '/slides'
        }).success(function(response){
            $scope.slides = response;
            sessionStorage.slides = JSON.stringify($scope.slides);
        });
    }
}]);

routeApp.controller('MeCtrl',["$scope", "$http", function($scope, $http) {

    // 返回用户信息，gravatar,name,cart,order{wait,received}
    if(angular.isUndefined(sessionStorage.user)) {
        $http({
            method: 'GET',
            url: host + '/user_info'
        }).success(function(response){
            $scope.user = response;
            sessionStorage.user = angular.toJson(response);
        });
    }
    else {
        $scope.user = angular.fromJson(sessionStorage.user);
    }
    
}]);

routeApp.controller('NoticesCtrl', ["$http", "$scope", function($http, $scope){

    $scope.busy = true;

    // 获取全部消息
    $http({
        method: 'GET',
        url: host + '/user_notices'
    }).success(function(response){
        $scope.notices = response;
        $scope.busy = false;
    });
    
}]);

routeApp.controller('BookCtrl', ["$scope", "$http", "$stateParams", "TEMP", function($scope, $http, $stateParams, TEMP) {
    $scope.more = false;            // 默认不加载更多书籍信息介绍
    $scope.busy = true;             // 页面加载动画Loading
    $scope.wait = false;            // 发表评论wait
    $scope.wait2 = false;           // 收藏图书wait
    $scope.wait3 = false;           // 加入购物车wait
    $scope.wait4 = false;           // 加入购物车提醒延迟
    $scope.wait5 = false;           // 收藏提醒延迟
    $scope.wait6 = false;           // 取消收藏延迟
    $scope.wait7 = false;           // 发布评论延迟
    $scope.required = true;         // 必填
    $scope.content = "";            // 初始评论
    $scope.star = 5;                // 默认星星数

    // 加入购物车
    $scope.addCart = function(){
        $scope.wait3 = true;
        $http({
            method: 'POST',
            url: host + '/cart',
            data: {
                isbn: $stateParams.isbn
            }
        }).success(function(){
            $scope.wait3 = false;
            $scope.wait4 = true;
            window.setTimeout(function() {
                $scope.$apply(function() {
                    $scope.wait4 = false;
                });
            }, 1500);
        });
    };

    // 根据ISBN号获取图书信息(包含评论和标签)
    $http({
        method: 'GET',
        url: host + '/book',
        params: {
            isbn: $stateParams.isbn
        }
    }).success(function(response){
        $scope.book = response;
        $scope.book.star = Math.ceil(response.rate/2);
        for (var i in $scope.book.comments){
            if($scope.book.comments.hasOwnProperty(i)){
                $scope.book.comments[i].star = Math.ceil($scope.book.comments[i].star/2);
            }
        }
        TEMP.setDict({title: $scope.book.title});
        $scope.busy = false;
    });

    // 获取用户信息,sessionStorage
    if(angular.isUndefined(sessionStorage.user)) {
        $http({
            method: 'GET',
            url: host + '/user_info'
        }).success(function(response){
            $scope.user = response;
            sessionStorage.user = angular.toJson(response);
        });
    }
    else {
        $scope.user = angular.fromJson(sessionStorage.user);
    }

    // 收藏图书
    $scope.collect = function() {
        $scope.wait2 = true;
        $http({
            method: 'POST',
            url: host + '/collect',
            data: {
                isbn: $stateParams.isbn,
                type: "book"
            }
        }).success(function () {
            $scope.book.collect_already = !$scope.book.collect_already;
            $scope.wait2 = false;
            if($scope.book.collect_already) {
                $scope.wait5 = true;
            }
            else {
                $scope.wait6 = true;
            }
            window.setTimeout(function() {
                $scope.$apply(function() {
                    $scope.wait5 = false;
                    $scope.wait6 = false;
                });
            }, delay);
        });
    };

    // todo 获取购买此书的人也购买的书籍
    $http({
        method: 'GET',
        url: host + '/book',
        params: {
            isbn: $stateParams.isbn,
            type: "similarity"
        }
    }).success(function(response){
        // $scope.booksBought = response.books;
        // for(var i=0;i<$scope.booksBought.length;i++){
        //     $scope.booksBought[i].star = Math.ceil($scope.booksBought[i].rate/2);
        // }
    });
    
    // 获取该书被收录的书单
    $http({
        method: 'GET',
        url: host + '/booklist',
        params: {
            isbn: $stateParams.isbn
        }
    }).success(function(response){
        $scope.booklists = response;
    });

    // 顶
    $scope.up = function(comment){
        $http({
            method: 'PUT',
            url: host + '/comment',
            data: {
                id: comment.id,
                type: "up"
            }
        }).success(function(){
            if(comment.down_already) {
                comment.down--;
            }
            comment.up_already = !comment.up_already;
            comment.down_already = false;
            if(comment.up_already)  {
                comment.up++;
            }
            else {
                comment.up--;
            }
        });
    };

    // 踩
    $scope.down = function(comment){
        $http({
            method: 'PUT',
            url: host + '/comment',
            data: {
                id: comment.id,
                type: "down"
            }
        }).success(function(){
            if(comment.up_already) {
                comment.up--;
            }
            comment.down_already = !comment.down_already;
            comment.up_already = false;
            if(comment.down_already)  {
                comment.down++;
            }
            else {
                comment.down--;
            }
        });
    };

    // 评论
    $scope.postComment = function(){
        if(!this.commentForm.content.$valid) return;
        $scope.wait = true;
        $http({
            method: 'POST',
            url: host + '/comment',
            data: {
                content: $scope.content,
                isbn: $stateParams.isbn,
                star: $scope.star*2
            }
        }).success(function(response){
            $scope.commentBox = false;
            $scope.wait7 = true;
            response.user = {
                avatar: $scope.user.avatar,
                username: $scope.user.username
            };
            response.star = response.star/2;
            $scope.book.commenters ++;
            $scope.book.comments.push(response);
            $scope.wait = false;
            $scope.content = "";
            window.setTimeout(function() {
                $scope.$apply(function() {
                    $scope.wait7 = false;
                });
            }, delay);
        });
    };
}]);

routeApp.controller('OrderDetailCtrl',["$scope", "$http", "$stateParams", function($scope, $http, $stateParams){

    $scope.price = 0;
    $scope.busy = true;
    $scope.status_list = [];
    $scope.wait = false;            // 取消订单提示
    $scope.wait2 = false;           // 操作时延

    // 获取订单详细信息
    $http({
        method: 'GET',
        url: host + '/billing',
        params: {
            id: $stateParams.id
        }
    }).success(function(response){
        $scope.order = response;
        $scope.order.status = statusDict[$scope.order.status];
        for(var i=0; i<$scope.order.carts.length; i++) {
            $scope.price += $scope.order.carts[i].number * $scope.order.carts[i].price;
        }
        for(var j=0; j<$scope.order.status_list.length; j++) {
            var temp = $scope.order.status_list[j].split('|');
            $scope.status_list.push({
                "status": statusDict[temp[0]],
                "time": temp[1]
            });
        }
        $scope.busy = false;
    });

    // 取消订单
    $scope.cancel = function(order){
        $scope.wait = true;
        $scope.wait2 = true;
        $http({
            method: 'DELETE',
            url: host + '/billing',
            data: {
                "id": order.id
            }
        }).success(function(){
            $scope.wait2 = false;
            $scope.order.status = "已取消";
            $scope.status_list.push({'status':'已取消','time': Date.parse(new Date())/1000});
            window.setTimeout(function() {
                $scope.$apply(function() {
                    $scope.wait = false;
                });
            }, delay);
        });
    };

    // 确认收货
    $scope.receipt = function(order){
        order.wait2 = true;
        $http({
            method: 'PUT',
            url: host + '/billing',
            data: {
                "id": order.id,
                "status": "commenting"
            }
        }).success(function(){
            $scope.status_list.push({'status':'已收货','time': Date.parse(new Date())/1000});
            $scope.order.status = "待评价";
        });
    };
}]);

routeApp.controller('OrdersCtrl',["$scope", "$http", "$stateParams", function($scope, $http, $stateParams) {

    $scope.message = false;
    $scope.busy = true;
    $scope.wait = false;        // 取消订单提示
    $scope.type = $stateParams.status;
    console.log($stateParams.status);

    /*
     * 备注:
     * return 传回可退换订单
     * on_return 传回 refund, refunding, refunded, replace, replaced, replacing, refund_refused, replace_refused 订单
     *
     */

    // 非法参数，返回
    if($stateParams.status !== "pending"
        && $stateParams.status !== "all"
        && $stateParams.status !== "commenting"
        && $stateParams.status !== "waiting"
        && $stateParams.status !== "return"
        && $stateParams.status !== "done"
    ) {
        history.back();
    }
    else if($stateParams.status == "return") {
        // todo 获取正在申请售后服务的订单
        $http({
            method: 'GET',
            url: host + '/user_billings',
            params: {
                status: "on_return"
            }
        }).success(function(response){
            $scope.orders_return = response;
            for(var x in $scope.orders_return){
                if($scope.orders_return.hasOwnProperty(x)){
                    $scope.orders_return[x].status = statusDict[$scope.orders_return[x].status];
                }
            }
        });
    }

    // 获取订单
    $http({
        method: 'GET',
        url: host + '/user_billings',
        params: {
            status: $stateParams.status
        }
    }).success(function(response){
        $scope.orders = response;
        for(var x in $scope.orders){
            if($scope.orders.hasOwnProperty(x)){
                $scope.orders[x].status = statusDict[$scope.orders[x].status];
            }
        }
        $scope.busy = false;
    });

    // todo 取消售后
    $scope.stop = function(order){
        order.wait2 = true;
    };

    // 取消订单    pending -> canceled
    $scope.cancel = function(order){
        order.wait2 = true;
        $http({
            method: 'DELETE',
            url: host + '/billing',
            data: {
                "id": order.id
            }
        }).success(function(){
            order.wait2 = false;
            order.status = "已取消";
        });
    };

    // 确认收货    waiting -> commenting
    $scope.receipt = function(order){
        order.wait2 = true;
        $http({
            method: 'PUT',
            url: host + '/billing',
            data: {
                "id": order.id,
                "status": "commenting"
            }
        }).success(function(){
            order.wait2 = false;
            order.status = "待评价";
        });
    };

}]);

routeApp.controller('OrderCommentsCtrl', ["$scope", "$http", "$stateParams", function($scope, $http, $stateParams){

    $scope.busy = true;
    $scope.wait = false;        // 等待
    $scope.alert = false;       // 错误提示

    // 获取待评价订单的详细信息, todo 订单待评价才允许继续
   $http({
       method: 'GET',
       url: host + '/billing',
       params: {
           id: $stateParams.id
       }
   }).success(function(response){
       $scope.order = response;
       $scope.busy = false;
   }).error(function(){
       history.back();
   });

    // todo 订单评价
    $scope.comment = function(){
        $scope.wait = true;
        if(!this.commentForm.$valid) {
            $scope.wait = false;
            $scope.alert = true;
            window.setTimeout(function() {
                $scope.$apply(function() {
                    $scope.alert = false;
                });
            }, 4000);
        }
        else {
            for(var i in $scope.order.carts){
                if($scope.order.carts.hasOwnProperty(i)){
                    $scope.commentBook($scope.order.carts[i].book);
                }
            }
        }
        // todo 平台评分
        $http({
            method: 'POST',
            url: host + '/user_billing',
            data: {
                stars1: $scope.stars1,
                stars2: $scope.stars2,
                stars3: $scope.stars3
            }
        }).success(function(response){

        });
    };

    // 书籍评价
    $scope.commentBook = function(book){
        console.log(book);
        $http({
            method: 'POST',
            url: host + '/comment',
            data: {
                content: book.content,
                isbn: book.isbn,
                star: book.star*2
            }
        });
    };
    
}]);

routeApp.controller('SettingsCtrl', ["$http", "$scope", function($http, $scope){

    $scope.user = JSON.parse(sessionStorage.user);

}]);

routeApp.controller('AddressCtrl', ["$http", "$scope", "$state", "User", function ($http, $scope, $state, User) {

    $scope.wait = true;

    // 获取用户地址信息
    $http({
        method: 'GET',
        url: host + '/user_address'
    }).success(function(response){
        $scope.address = response;
        $scope.wait = false;
    });

    $scope.edit = function(){
        User.setTemp(this.x);
        $state.go('AddressAdd');
    };

    // 返回上层
    $scope.back = function() {
        history.back();
    };
}]);
routeApp.controller('RecommendMoreCtrl',["$scope", "BL", function($scope, BL) {

    // 获取更多推荐书籍
    var url = host + '/pop_book';
    var params = {
        page: 1
    };
    $scope.books = new BL(url, params);
    
}]);

routeApp.controller('AddressAddCtrl', ["$http", "$scope", "$location", "$state", "User", function($http, $scope, $location, $state, User){

    var data = User.getTemp();
    $scope.edit = false;

    $scope.correct_name = false;
    $scope.correct_dorm = false;
    $scope.correct_phone = false;
    $scope.ok1 = false;                  // 添加成功提示
    $scope.ok2 = false;                 // 修改成功提示
    $scope.ok3 = false;                 // 删除成功提示
    $scope.ok4 = false;                 // 设置默认地址成功提示
    $scope.wait1 = false;               // 添加等待动画
    $scope.wait2 = false;               // 修改等待动画
    $scope.wait3 = false;               // 删除等待动画
    $scope.wait4 = false;               //　设置默认地址成功动画

    if(JSON.stringify(data) != '{}') {
        $scope.name = data.name;
        $scope.phone = data.phone;
        $scope.dorm = data.dormitory;
        $scope.id = data.id;
        $scope.edit = true;
        User.setTemp({});
    }
    
    // 添加和修改地址
    $scope.add = function(){
        if(this.addressForm.$invalid) {
            if(this.addressForm.name.$invalid)  {
                $scope.correct_name = true;
                window.setTimeout(function() {
                    $scope.$apply(function() {
                        $scope.correct_name = false;
                    });
                }, 2500);
            }
            else if(this.addressForm.phone.$invalid)  {
                $scope.correct_phone = true;
                window.setTimeout(function() {
                    $scope.$apply(function() {
                        $scope.correct_phone = false;
                    });
                }, 2500);
            }
            else if(this.addressForm.dorm.$invalid)  {
                $scope.correct_dorm = true;
                window.setTimeout(function() {
                    $scope.$apply(function() {
                        $scope.correct_dorm = false;
                    });
                }, 2500);
            }
        }
        else{
            // 编辑状态
            if($scope.edit) {
                $scope.wait2 = true;
                $http({
                    method: 'PUT',
                    url: host + '/user_address',
                    data: {
                        name: $scope.name,
                        phone: $scope.phone,
                        dormitory: $scope.dorm,
                        id: $scope.id
                    }
                }).success(function(){
                    $scope.wait2 = false;
                    $scope.ok2 = true;
                    window.setTimeout(function() {
                        $scope.$apply(function() {
                            $scope.ok2 = false;
                            $scope.back();
                        });
                    }, 1000);
                });
            }
            // 添加状态
            else {
                $scope.wait1 = true;
                $http({
                    method: 'POST',
                    url: host + '/user_address',
                    data: {
                        name: $scope.name,
                        phone: $scope.phone,
                        dormitory: $scope.dorm
                    }
                }).success(function(){
                    $scope.wait1 = false;
                    $scope.ok1 = true;
                    window.setTimeout(function() {
                        $scope.$apply(function() {
                            $scope.ok1 = false;
                            $scope.back();
                        });
                    }, 1000);
                });
            }
        }
    };

    // 删除地址
    $scope.delete = function(id) {
        $scope.wait3 = true;
        $http({
            method: 'DELETE',
            url: host + '/user_address',
            data: {
                id: id
            }
        }).success(function(){
            $scope.ok3 = true;
            $scope.wait3 = false;
            window.setTimeout(function() {
                $scope.$apply(function() {
                    $scope.ok3 = false;
                    $scope.back();
                });
            }, 1000);
        });
    };

    // 设置默认地址
    $scope.setDefault = function(id) {
        $scope.wait4 = true;
        $http({
            method: 'PUT',
            url: host + '/user_address',
            data: {
                id: id,
                name: $scope.name,
                phone: $scope.phone,
                dormitory: $scope.dorm,
                type: "default"
            }
        }).success(function(){
            $scope.ok4 = true;
            $scope.wait4 = false;
            window.setTimeout(function() {
                $scope.$apply(function() {
                    $scope.ok4 = false;
                    $scope.back();
                })
            }, 1000);
        })
    };

    // 返回上层
    $scope.back = function() {
        history.back();
    };
    
}]);

routeApp.controller('TagBooklistsCtrl', ["$scope", "BL", "$stateParams", function($scope, BL, $stateParams){

    // 获取指定标签的书单
    var url = host + '/booklist';
    var params = {
        tag: $stateParams.tag,
        page: 1
    };
    $scope.booklists = new BL(url,params);
    
    // 时间优先
    $scope.timeOrder = function(){
        var url = host + '/booklist';
        var params = {
            tag: $stateParams.tag,
            page: 1,
            type: "time"
        };
        $scope.booklists = new BL(url,params);
        $scope.booklists.nextPage();
    };

    // 收藏优先
    $scope.collectOrder = function(){
        var url = host + '/booklist';
        var params = {
            tag: $stateParams.tag,
            page: 1,
            type: "collect"
        };
        $scope.booklists = new BL(url,params);
        $scope.booklists.nextPage();
    };

}]);

routeApp.controller('SuggestCtrl', ["$http", "$scope", function($http, $scope){

    $scope.required = true;     // 必填
    $scope.wait = false;        // 提交反馈wait
    $scope.wait2 = false;       // 提交反馈动画时延

    if(sessionStorage.user != undefined) {
        $scope.user = JSON.parse(sessionStorage.user);
    }
    else {
        $http({
            method: 'GET',
            url: host + '/user_info'
        }).success(function(response){
            $scope.user = response;
            sessionStorage.user = JSON.stringify(response);
        });
    }

    // 发布建议和看法
    $scope.post = function(){
        if(this.suggestBox.suggestion.$invalid) {
            return;
        }
        $scope.wait = true;
        $http({
            method: 'POST',
            url: host + '/user_feedback',
            data: {
                content: $scope.suggestion
            }
        }).success(function(){
            $scope.wait = false;
            $scope.wait2 = true;
            window.setTimeout(function() {
                $scope.$apply(function() {
                    $scope.wait2 = false;
                    history.back();
                });
            }, 2000);
        });
    };

}]);
routeApp.controller('PointCtrl', ["$http", "$scope", function($http, $scope){

    $scope.busy = true;

    // 获取积分记录
    $http({
        method: 'GET',
        url: host + '/user_points'
    }).success(function(response){
        $scope.points = response;
        $scope.busy = false;
    });
    
}]);

routeApp.controller('UserCommentsCtrl', ["$http", "$scope", function($http, $scope){
    
    $scope.deleteBox = false;       // 删除确认框
    $scope.edit = false;            // 可编辑
    $scope.readonly = true;         // 只读
    $scope.busy = true;
    $scope.wait = false;
    $scope.required = true;
    $scope.wait2 = false;            // 删除等待
    $scope.wait3 = false;            // 删除提示时延

    // 用户所有评论
    $http({
        method: 'GET', 
        url: host + '/user_comments'
    }).success(function(response){
        $scope.comments = response;
        for (var i=0; i< $scope.comments.length; i++){
            $scope.comments[i].star = Math.ceil($scope.comments[i].star/2);
        }
        $scope.busy = false;
    });

    $scope.focus = function(obj){
        obj.readonly = false;
        obj.edit = true;
    };
    
    // 修改评论
    $scope.submit = function(obj){
        if(!obj.commentForm.content.$valid){
            return;
        }
        obj.wait = true;
        $http({
            method: 'PUT',
            url: host + '/comment',
            data:{
                id: obj.comment.id,
                type: "edit",
                content: obj.comment.content,
                star: obj.comment.star*2
            }
        }).success(function(){
            obj.wait = false;
            obj.readonly = true;
            obj.edit = false;
        });
    };
    
    // 删除评论
    $scope.delete = function(id, index){
        $scope.wait2 = true;
        $http({
            method: 'DELETE',
            url: host + '/comment',
            data: {
                id: id
            }
        }).success(function(){
            $scope.wait2 = false;
            $scope.wait3 = true;
            $scope.comments.splice(index, 1);
            window.setTimeout(function() {
                $scope.$apply(function() {
                    $scope.wait3 = false;
                });
            }, delay);
        });
    };
}]);

routeApp.controller('TagsCtrl', ["$scope", "$http", function($scope, $http){

    $scope.busy = true;

    // 获取全部标签
    $http({
        method: 'GET',
        url: host + '/tags',
        params: {
            type: "all"
        }
    }).success(function(response){
        $scope.busy = false;
        $scope.allTags = response;
    });

}]);

routeApp.controller('PopularMoreCtrl',["$scope", "BL", function($scope, BL) {

    // 获取更多热门书单
    var url = host + '/booklist';
    var params = {
        type: "hot",
        page: 1
    };
    $scope.booklists = new BL(url,params);

}]);

routeApp.controller('SignatureCtrl', ["$http", "$scope", "$stateParams", "$location", function ($http, $scope, $stateParams, $location) {

    $scope.signature = $stateParams.signature;

    // 修改签名
    $scope.post = function() {
        $http({
            method: 'POST',
            url: host + '/signature',
            data: {
                signature: this.signature
            }
        }).success(function () {
            $location.path('/settings').replace();
        });
    };
    
    $scope.return = function() {
        $location.path('/settings').replace();
    };

}]);