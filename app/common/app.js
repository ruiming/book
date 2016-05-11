var routeApp = angular.module('index',['ui.router','ui.bootstrap','ngAnimate','ngTouch','infinite-scroll']);

var host = "http://bookist.org";
// var host = "http://119.29.204.83:5000";

routeApp.config(['$stateProvider','$locationProvider','$httpProvider', '$urlRouterProvider',function ($stateProvider,$locationProvider,$httpProvider,$urlRouterProvider) {

    // modify response from transformResponse and alert error
    $httpProvider.defaults.transformResponse.push(function (response) {
        if(typeof(response.data) != "undefined") {
            if(response.status == "success"){
                response = response.data;
                return response;
            }
        }
        if(response.status == "error") {
            // todo change to alert when work
            console.log("----------------Error----------------: " + response.message);
        }
        return response;
    });

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

    // redirect to "/" if not match
    $urlRouterProvider.otherwise("/");

    // routes
    $stateProvider
        .state('index', {
            url: '/',
            templateUrl: 'index/index_tpl.html',
            controller: 'IndexCtrl'
        })
        .state('recommend',{
            url: '/books/recommend',
            controller: 'RecommendMoreCtrl',
            templateUrl: 'recommend_more/recommend_more_tpl.html'
        })
        .state('booklists',{
            url: '/booklists',
            controller: 'BooklistsCtrl',
            templateUrl: 'booklists/booklists_tpl.html'
        })
        .state('popular',{
            url: '/booklists/popular',
            controller: 'PopularMoreCtrl',
            templateUrl: 'popular_more/popular_more_tpl.html'
        })
        .state('book',{
            url: '/book/{isbn}',
            controller: 'BookCtrl',
            templateUrl: 'book/book_tpl.html'
        })
        .state('bookDetail',{
            url: '/book/{isbn}/detail',
            controller: 'BookInfoCtrl',
            templateUrl: 'book_info/book_info_tpl.html'
        })
        .state('booklist',{
            url: '/booklist/{id}',
            controller: 'BookListCtrl',
            templateUrl: 'booklist/booklist_tpl.html'
        })
        .state('tagBooklists',{
            url: '/booklists/{tag}',
            controller: 'TagBooklistsCtrl',
            templateUrl: 'tag-booklists/tag-booklists_tpl.html'
        })
        .state('commentsBook',{
            url: '/comments/{isbn}',
            controller: 'CommentsCtrl',
            templateUrl: 'comments/comments_tpl.html'
        })
        .state('tags',{
            url: '/tags',
            controller: 'TagsCtrl',
            templateUrl: 'tags/tags_tpl.html'
        })
        .state('me',{
            url: '/me',
            controller: 'MeCtrl',
            templateUrl: 'me/me_tpl.html'
        })
        .state('ordersWait',{
            url: '/orders/wait',
            controller: 'OrdersWaitCtrl',
            templateUrl: 'orders_wait/orders_wait_tpl.html'
        })
        .state('cart',{
            url: '/cart',
            controller: 'CartCtrl',
            templateUrl: 'cart/cart_tpl.html'
        })
        .state('ordersReceived',{
            url: '/orders/received',
            controller: 'OrdersReceivedCtrl',
            templateUrl: 'orders_received/orders_received_tpl.html'
        })
        .state('orders',{
            url: '/orders',
            controller: 'OrdersCtrl',
            templateUrl: ' app/module/orders/orders_tpl.html'
        })
        .state('orderDetail',{
            url: '/order/{id}/detail',
            controller: 'OrderDetailCtrl',
            templateUrl: 'order_detail/order_detail_tpl.html'
        })
        .state('orderComments',{
            url: '/order/{id}/comments',
            controller: 'OrderCommentsCtrl',
            templateUrl: 'order_comments/order_comments_tpl.html'
        })
        .state('comments',{
            url: '/comments',
            controller: 'UserCommentsCtrl',
            templateUrl: 'user_comments/user_comments_tpl.html'
        })
        .state('booklistsCollect',{
            url: '/collect/booklists',
            controller: 'CollectBookListsCtrl',
            templateUrl: 'collect_booklists/collect_booklists_tpl.html'
        })
        .state('booksCollect',{
            url: '/collect/books',
            controller: 'CollectBooksCtrl',
            templateUrl: 'collect_books/collect_books_tpl.html'
        })
        .state('point', {
            url: '/point',
            controller: 'PointCtrl',
            templateUrl: 'point/point_tpl.html'
        })
        .state('notices',{
            url: '/notices',
            controller: 'NoticesCtrl',
            templateUrl: 'notices/notices_tpl.html'
        })
        .state('settings', {
            url: '/settings',
            controller: 'SettingsCtrl',
            templateUrl: 'settings/settings_tpl.html'
        })
        .state('signature', {
            url: '/setting/signature/{signature}',
            controller: 'SignatureCtrl',
            templateUrl: 'setting_signature/setting_signature_tpl.html'
        })
        .state('address', {
            url: '/setting/address',
            controller: 'AddressCtrl',
            templateUrl: 'setting_address/setting_address_tpl.html'
        })
        .state('AddressAdd', {
            url: '/setting/address/add',
            controller: 'AddressAddCtrl',
            templateUrl: 'setting_address_add/setting_address_add_tpl.html'
        })
        .state('suggest', {
            url: '/suggest',
            controller: 'SuggestCtrl',
            templateUrl: 'suggest/suggest_tpl.html'
        });
}]);
