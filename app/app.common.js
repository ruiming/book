(function() {
    'use strict';

    angular
        .module('index', [
            'ui.router',
            'ui.bootstrap',
            'ngAnimate',
            'ngSanitize',
            'ngTouch',
            'angularPromiseButtons'
        ])
        .config(config)
        .run(function ($state,$rootScope) {
            $rootScope.$state = $state;
        });

    config.$inject = ['$stateProvider', '$locationProvider', '$httpProvider', '$urlRouterProvider', 'angularPromiseButtonsProvider'];
    function config($stateProvider, $locationProvider, $httpProvider, $urlRouterProvider, angularPromiseButtonsProvider) {
        $httpProvider.defaults.transformResponse.push(response => {
            if(notices[response.status_id] !== void 0) {
                notie.alert(1, notices[response.status_id], 0.3);
            }
            if(angular.isDefined(response.data)&& response.status === 'success') {
                response = response.data;
                return response;
            }
            return response;
        });

        $httpProvider.interceptors.push('timestampMarker');

        $httpProvider.interceptors.push('tokenInjector');

        $httpProvider.defaults.transformRequest = obj => {
            var str = [];
            for(var p in obj){
                str.push(encodeURIComponent(p) + '=' + encodeURIComponent(obj[p]));
            }
            return str.join('&');
        };

        $locationProvider.html5Mode(true);
        $httpProvider.defaults.headers.post = {'Content-Type': 'application/x-www-form-urlencoded'};
        $httpProvider.defaults.headers.put = {'Content-Type': 'application/x-www-form-urlencoded'};
        $httpProvider.defaults.headers.delete = {'Content-Type': 'application/x-www-form-urlencoded'};
        // redirect to '/' if not match
        $urlRouterProvider.otherwise('/');

        angularPromiseButtonsProvider.extendConfig({
            spinnerTpl: '<i class="btn-spinner"></i>',
            disableBtn: true,
            btnLoadingClass: 'is-loading',
            addClassToCurrentBtnOnly: false,
            disableCurrentBtnOnly: false
        });


        // routes
        $stateProvider
            .state('index', {
                url: '/',
                templateUrl: 'index/index_tpl.html',
                controller: 'IndexCtrl',
                controllerAs: 'vm',
                nav: true,
                resolve: {
                    hotBooklists: function(booklistservice) {
                        return booklistservice.getHotBooklists()
                            .then(response => response);
                    },
                    slides: function(slideservice) {
                        return slideservice.getSlides()
                            .then(response => response);
                    },
                    popularBooks: function(bookservice) {
                        return bookservice.getPopularBooks2()
                            .then(response => response);
                    }
                }
            })
            .state('cart',{
                url: '/cart',
                controller: 'CartCtrl',
                templateUrl: 'cart/cart_tpl.html',
                controllerAs: 'vm',
                nav: true
            })
            .state('me',{
                url: '/me',
                controller: 'MeCtrl',
                templateUrl: 'me/me_tpl.html',
                controllerAs: 'vm',
                nav: true
            })
            .state('booklists',{
                url: '/booklists',
                controller: 'BooklistsCtrl',
                templateUrl: 'booklists/booklists_tpl.html',
                controllerAs: 'vm',
                nav: true
            })
            .state('recommend',{
                url: '/books/recommend',
                controller: 'RecommendMoreCtrl',
                templateUrl: 'recommend_more/recommend_more_tpl.html',
                controllerAs: 'vm'
            })
            .state('popular',{
                url: '/booklists/popular',
                controller: 'PopularMoreCtrl',
                templateUrl: 'popular_more/popular_more_tpl.html',
                controllerAs: 'vm'
            })
            .state('book',{
                url: '/book/{isbn}',
                controller: 'BookCtrl',
                templateUrl: 'book/book_tpl.html',
                controllerAs: 'vm',
                resolve: {
                    book: function(bookservice, $stateParams) {
                        return bookservice.getBook($stateParams.isbn)
                            .then(response => response);
                    }
                }
            })
            .state('bookDetail',{
                url: '/book/{isbn}/detail',
                controller: 'BookInfoCtrl',
                templateUrl: 'book_info/book_info_tpl.html',
                controllerAs: 'vm',
                resolve: {
                    bookDetail: function(bookservice, $stateParams) {
                        return bookservice.getBookDetail($stateParams.isbn)
                            .then(response => response);
                    }
                }
            })
            .state('booklist',{
                url: '/booklist/{id}',
                controller: 'BookListCtrl',
                templateUrl: 'booklist/booklist_tpl.html',
                controllerAs: 'vm',
                resolve: {
                    booklist: function($stateParams, booklistservice) {
                        return booklistservice.getBooklistDetail($stateParams.id)
                            .then(response => {
                                for(let book of response.books) {
                                    book.star = Math.ceil(book.rate / 2);
                                }
                                return response;
                        });
                    }
                }
            })
            .state('booklistComments', {
                url: '/booklist/{id}/comments',
                controller: 'BooklistCommentsCtrl',
                templateUrl: 'booklist_comments/booklist_comments_tpl.html',
                controllerAs: 'vm'
            })
            .state('tagBooklists',{
                url: '/booklists/{tag}',
                controller: 'TagBooklistsCtrl',
                templateUrl: 'tag-booklists/tag-booklists_tpl.html',
                controllerAs: 'vm'
            })
            .state('commentsBook',{
                url: '/comments/{isbn}',
                controller: 'CommentsCtrl',
                templateUrl: 'comments/comments_tpl.html',
                controllerAs: 'vm'
            })
            .state('tags',{
                url: '/tags',
                controller: 'TagsCtrl',
                templateUrl: 'tags/tags_tpl.html',
                controllerAs: 'vm'
            })
            .state('orders',{
                url: '/orders/{status}/show',
                controller: 'OrdersCtrl',
                templateUrl: 'orders/orders_tpl.html',
                controllerAs: 'vm'
            })
            .state('orderDetail',{
                url: '/order/{id}/detail',
                controller: 'OrderDetailCtrl',
                templateUrl: 'order_detail/order_detail_tpl.html',
                controllerAs: 'vm'
            })
            .state('orderComments',{
                url: '/order/{id}/comments',
                controller: 'OrderCommentsCtrl',
                templateUrl: 'order_comments/order_comments_tpl.html',
                controllerAs: 'vm'
            })
            .state('ordersCommented', {
                url: '/orders/commented',
                controller: 'OrdersCommentedCtrl',
                templateUrl: 'orders_commented/orders_commented_tpl.html',
                controllerAs: 'vm'
            })
            .state('comments',{
                url: '/comments',
                controller: 'UserCommentsCtrl',
                templateUrl: 'user_comments/user_comments_tpl.html',
                controllerAs: 'vm'
            })
            .state('booklistsCollect',{
                url: '/collect/booklists',
                controller: 'CollectBookListsCtrl',
                templateUrl: 'collect_booklists/collect_booklists_tpl.html',
                controllerAs: 'vm'
            })
            .state('booksCollect',{
                url: '/collect/books',
                controller: 'CollectBooksCtrl',
                templateUrl: 'collect_books/collect_books_tpl.html',
                controllerAs: 'vm'
            })
            .state('point', {
                url: '/point',
                controller: 'PointCtrl',
                templateUrl: 'point/point_tpl.html',
                controllerAs: 'vm'
            })
            .state('notices',{
                url: '/notices',
                controller: 'NoticesCtrl',
                templateUrl: 'notices/notices_tpl.html',
                controllerAs: 'vm'
            })
            .state('settings', {
                url: '/settings',
                controller: 'SettingsCtrl',
                templateUrl: 'settings/settings_tpl.html',
                controllerAs: 'vm'
            })
            .state('address', {
                url: '/setting/address',
                controller: 'AddressCtrl',
                templateUrl: 'setting_address/setting_address_tpl.html',
                controllerAs: 'vm'
            })
            .state('AddressAdd', {
                url: '/setting/address/add',
                controller: 'AddressAddCtrl',
                templateUrl: 'setting_address_add/setting_address_add_tpl.html',
                controllerAs: 'vm'
            })
            .state('cart2order', {
                url: '/cart2order',
                controller: 'Cart2OrderCtrl',
                templateUrl: 'cart2order/cart2order_tpl.html',
                controllerAs: 'vm'
            })
            .state('suggest', {
                url: '/suggest',
                controller: 'SuggestCtrl',
                templateUrl: 'suggest/suggest_tpl.html',
                controllerAs: 'vm'
            })
    }

})();
