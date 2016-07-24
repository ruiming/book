(function() {
    'use strict';

    angular
        .module('index', [
            'ui.router',
            'ui.bootstrap',
            'ngAnimate',
            'ngSanitize',
            'ngTouch',
        ])
        .config(config);

    config.$inject = ['$stateProvider', '$locationProvider', '$httpProvider', '$urlRouterProvider'];
    function config($stateProvider, $locationProvider, $httpProvider, $urlRouterProvider) {
        $httpProvider.defaults.transformResponse.push(response => {
            if(response.message !== void 0) {
                notie.alert(1, response.message, 0.3);
            }
            if(typeof(response.data) != "undefined" && response.status === "success") {
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
                str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
            }
            return str.join("&");
        };

        $locationProvider.html5Mode(true);
        $httpProvider.defaults.headers.post = {'Content-Type': 'application/x-www-form-urlencoded'};
        $httpProvider.defaults.headers.put = {'Content-Type': 'application/x-www-form-urlencoded'};
        $httpProvider.defaults.headers.delete = {'Content-Type': 'application/x-www-form-urlencoded'};
        // redirect to "/" if not match
        $urlRouterProvider.otherwise("/");

        // routes
        $stateProvider
            .state('index', {
                url: '/',
                views: {
                    'main': {
                        templateUrl: 'index/index_tpl.html',
                        controller: 'IndexCtrl',
                        controllerAs: 'vm'
                    }
                }
            })
            .state('recommend',{
                url: '/books/recommend',
                views: {
                    'main': {
                        controller: 'RecommendMoreCtrl',
                        templateUrl: 'recommend_more/recommend_more_tpl.html',
                        controllerAs: 'vm'
                    }
                }
            })
            .state('booklists',{
                url: '/booklists',
                views: {
                    'main': {
                        controller: 'BooklistsCtrl',
                        templateUrl: 'booklists/booklists_tpl.html',
                        controllerAs: 'vm'
                    }
                }
            })
            .state('popular',{
                url: '/booklists/popular',
                views: {
                    'main': {
                        controller: 'PopularMoreCtrl',
                        templateUrl: 'popular_more/popular_more_tpl.html',
                        controllerAs: 'vm'
                    }
                }
            })
            .state('book',{
                url: '/book/{isbn}',
                views: {
                    'main': {
                        controller: 'BookCtrl',
                        templateUrl: 'book/book_tpl.html',
                        controllerAs: 'vm'
                    }
                }
            })
            .state('bookDetail',{
                url: '/book/{isbn}/detail',
                views: {
                    'main': {
                        controller: 'BookInfoCtrl',
                        templateUrl: 'book_info/book_info_tpl.html',
                        controllerAs: 'vm'
                    }
                }
            })
            .state('booklist',{
                url: '/booklist/{id}',
                views: {
                    'main': {
                        controller: 'BookListCtrl',
                        templateUrl: 'booklist/booklist_tpl.html',
                        controllerAs: 'vm'
                    }
                }
            })
            .state('tagBooklists',{
                url: '/booklists/{tag}',
                views: {
                    'main': {
                        controller: 'TagBooklistsCtrl',
                        templateUrl: 'tag-booklists/tag-booklists_tpl.html'
                    }
                }
            })
            .state('commentsBook',{
                url: '/comments/{isbn}',
                views: {
                    'main': {
                        controller: 'CommentsCtrl',
                        templateUrl: 'comments/comments_tpl.html',
                        controllerAs: 'vm'
                    }
                }
            })
            .state('tags',{
                url: '/tags',
                views: {
                    'main': {
                        controller: 'TagsCtrl',
                        templateUrl: 'tags/tags_tpl.html'
                    }
                }
            })
            .state('me',{
                url: '/me',
                views: {
                    'main': {
                        controller: 'MeCtrl',
                        templateUrl: 'me/me_tpl.html',
                        controllerAs: 'vm'
                    }
                }
            })
            .state('cart',{
                url: '/cart',
                views: {
                    'main': {
                        controller: 'CartCtrl',
                        templateUrl: 'cart/cart_tpl.html',
                        controllerAs: 'vm'
                    }
                }
            })
            .state('orders',{
                url: '/orders/{status}/show',
                views: {
                    'main': {
                        controller: 'OrdersCtrl',
                        templateUrl: 'orders/orders_tpl.html',
                        controllerAs: 'vm'
                    }
                }
            })
            .state('orderDetail',{
                url: '/order/{id}/detail',
                views: {
                    'main': {
                        controller: 'OrderDetailCtrl',
                        templateUrl: 'order_detail/order_detail_tpl.html',
                        controllerAs: 'vm'
                    },
                    'nav': {
                        template: '<span></span>'
                    }
                }
            })
            .state('orderComments',{
                url: '/order/{id}/comments',
                views: {
                    'main': {
                        controller: 'OrderCommentsCtrl',
                        templateUrl: 'order_comments/order_comments_tpl.html',
                        controllerAs: 'vm'
                    },
                    'nav': {
                        template: '<span></span>'
                    }
                }
            })
            .state('ordersCommented', {
                url: '/orders/commented',
                views: {
                    'main': {
                        controller: 'OrdersCommentedCtrl',
                        templateUrl: 'orders_commented/orders_commented_tpl.html'
                    }
                }
            })
            .state('comments',{
                url: '/comments',
                views: {
                    'main': {
                        controller: 'UserCommentsCtrl',
                        templateUrl: 'user_comments/user_comments_tpl.html'
                    }
                }
            })
            .state('booklistsCollect',{
                url: '/collect/booklists',
                views: {
                    'main': {
                        controller: 'CollectBookListsCtrl',
                        templateUrl: 'collect_booklists/collect_booklists_tpl.html',
                        controllerAs: 'vm'
                    }
                }
            })
            .state('booksCollect',{
                url: '/collect/books',
                views: {
                    'main': {
                        controller: 'CollectBooksCtrl',
                        templateUrl: 'collect_books/collect_books_tpl.html'
                    }
                }
            })
            .state('point', {
                url: '/point',
                views: {
                    'main': {
                        controller: 'PointCtrl',
                        templateUrl: 'point/point_tpl.html',
                        controllerAs: 'vm'
                    }
                }
            })
            .state('notices',{
                url: '/notices',
                views: {
                    'main': {
                        controller: 'NoticesCtrl',
                        templateUrl: 'notices/notices_tpl.html',
                        controllerAs: 'vm'
                    }
                }
            })
            .state('settings', {
                url: '/settings',
                views: {
                    'main': {
                        controller: 'SettingsCtrl',
                        templateUrl: 'settings/settings_tpl.html'
                    }
                }
            })
            .state('address', {
                url: '/setting/address',
                views: {
                    'main': {
                        controller: 'AddressCtrl',
                        templateUrl: 'setting_address/setting_address_tpl.html'
                    }
                }
            })
            .state('AddressAdd', {
                url: '/setting/address/add',
                views: {
                    'main': {
                        controller: 'AddressAddCtrl',
                        templateUrl: 'setting_address_add/setting_address_add_tpl.html'
                    }
                }
            })
            .state('cart2order', {
                url: '/cart2order',
                views: {
                    'main': {
                        controller: 'Cart2OrderCtrl',
                        templateUrl: 'cart2order/cart2order_tpl.html',
                        controllerAs: 'vm'
                    },
                    'nav': {
                        template: '<span></span>'
                    }
                }
            })
            .state('suggest', {
                url: '/suggest',
                views: {
                    'main': {
                        controller: 'SuggestCtrl',
                        templateUrl: 'suggest/suggest_tpl.html'
                    }
                }
            });
    }

})();
