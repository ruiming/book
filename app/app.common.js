(function() {
    'use strict';

    angular
        .module('index', [
            'ui.router',
            'ui.bootstrap',
            'ngAnimate',
            'ngSanitize',
            'ngTouch',
            'infinite-scroll',
            'angularPromiseButtons',
            'base64',
            'ngCookies'
        ])
        .config(config)
        .run(function ($state, $rootScope, tokenInjector, $location, $window) {
            // just experimental
            let re = /\?token=(\S+)&user_id=(\S+)#/;
            let absUrl = $location.absUrl();
            let data = absUrl.match(re);
            let token, userid;
            if(data) {
                token = data[1];
                userid = data[2];
            } else {
                token = $window.localStorage.getItem('token');
                userid = $window.localStorage.getItem('userid');
            }
            tokenInjector.setAuth(token, userid);
            $rootScope.$state = $state;
            $rootScope.$on("$stateChangeStart", function (event, toState, toStateParams, fromState, fromStateParams) {
                var isLoading = toState.resolve;
                if(!isLoading) {
                    for (var prop in toState.views) {
                        if (toState.views.hasOwnProperty(prop)) {
                            if(toState.views[prop].resolve) {
                                isLoading = true;
                                break;
                            }
                        }
                    }
                }
                if (isLoading) {
                    $rootScope.loading = true;
                }
            });

            $rootScope.$on("$stateChangeSuccess", function (event, toState, toStateParams, fromState, fromParams) {
                if(ga) {
                    let re = /\{(.*?)}/g, url;
                    if(Object.keys(toStateParams).length > 0) {
                        url = toState.url.replace(re, Object.values(toStateParams).reduce((pre, curr) => curr));
                    } else {
                        url = toState.url;
                    }
                    ga('send', 'pageview', url);
                }
                $rootScope.loading = false;
            });

            $rootScope.$on("$stateChangeError", function (event, toState, toStateParams, fromState, fromParams, error) {
                $rootScope.loading = false;
            });
        });

    function config($stateProvider, $locationProvider, $httpProvider, $urlRouterProvider, angularPromiseButtonsProvider, $compileProvider, $cookiesProvider) {
        $compileProvider.debugInfoEnabled(false);
        $cookiesProvider.defaults.expires = new Date(new Date().getTime() +  86400000000);
        $httpProvider.interceptors.push('timestampMarker');

        $httpProvider.interceptors.push('tokenInjector');

        $httpProvider.defaults.transformRequest = obj => {
            var str = [];
            for(var p in obj){
                str.push(encodeURIComponent(p) + '=' + encodeURIComponent(obj[p]));
            }
            return str.join('&');
        };

        // This can directly change to true in order to hide the synatx '#'
        $locationProvider.html5Mode(false);
        $httpProvider.defaults.headers.post = {'Content-Type': 'application/x-www-form-urlencoded'};
        $httpProvider.defaults.headers.put = {'Content-Type': 'application/x-www-form-urlencoded'};
        $httpProvider.defaults.headers.delete = {'Content-Type': 'application/x-www-form-urlencoded'};
        $httpProvider.defaults.headers.patch = {'Content-Type': 'application/x-www-form-urlencoded'};
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
                controller: 'IndexCtrl as vm',
                nav: true,
                resolve: {
                    hotBooklists: function(booklistservice) {
                        return booklistservice.getHotBooklists()
                    },
                    slides: function(slideservice) {
                        return slideservice.getSlides()
                    },
                    popularBooks: function(bookservice) {
                        return bookservice.getPopularBooks(1)
                    }
                }
            })
            .state('cart',{
                url: '/cart',
                controller: 'CartCtrl as vm',
                templateUrl: 'cart/cart_tpl.html',
                nav: true,
                resolve: {
                    cart: function(cartservice) {
                        return cartservice.getCart().then(response => {
                            let index = 1;
                            for(let item of response) {
                                item.checked = false;
                                item.index = index++;
                                item.deleted = false;
                            }
                            return response;
                        });
                    }
                }
            })
            .state('me',{
                url: '/me',
                controller: 'MeCtrl as vm',
                templateUrl: 'me/me_tpl.html',
                nav: true,
                resolve: {
                    me: function(userservice) {
                        return userservice.getUserInfo(true)
                    }
                }
            })
            .state('booklists',{
                url: '/booklists',
                controller: 'BooklistsCtrl as vm',
                templateUrl: 'booklists/booklists_tpl.html',
                nav: true,
                resolve: {
                    tags: function(tagservice) {
                        return tagservice.getHotTags()
                    },
                    booklists: function(booklistservice) {
                        return booklistservice.getBooklists(1, 'all')
                    }
                }
            })
            .state('recommend',{
                url: '/books/recommend',
                controller: 'RecommendMoreCtrl as vm',
                templateUrl: 'recommend_more/recommend_more_tpl.html',
                resolve: {
                    books: function(bookservice) {
                        return bookservice.getPopularBooks(1)
                    }
                }
            })
            .state('popular',{
                url: '/booklists/popular',
                controller: 'PopularMoreCtrl as vm',
                templateUrl: 'popular_more/popular_more_tpl.html',
                resolve: {
                    booklists: function(booklistservice) {
                        return booklistservice.getBooklists(1)
                    }
                }
            })
            .state('book',{
                url: '/book/{isbn}',
                controller: 'BookCtrl as vm',
                templateUrl: 'book/book_tpl.html',
                resolve: {
                    book: function(bookservice, $stateParams) {
                        return bookservice.getBook($stateParams.isbn)
                    }
                }
            })
            .state('bookDetail',{
                url: '/book/{isbn}/detail',
                controller: 'BookInfoCtrl as vm',
                templateUrl: 'book_info/book_info_tpl.html',
                resolve: {
                    bookDetail: function(bookservice, $stateParams) {
                        return bookservice.getBookDetail($stateParams.isbn)
                    }
                }
            })
            .state('booklist',{
                url: '/booklist/{id}',
                controller: 'BookListCtrl as vm',
                templateUrl: 'booklist/booklist_tpl.html',
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
                url: '/booklist/{id}/{title}/comments',
                controller: 'BooklistCommentsCtrl as vm',
                templateUrl: 'booklist_comments/booklist_comments_tpl.html',
                resolve: {
                    title: function($stateParams) {
                        return $stateParams.title;
                    }
                }
            })
            .state('tagBooklists',{
                url: '/booklists/{tag}',
                controller: 'TagBooklistsCtrl as vm',
                templateUrl: 'tag-booklists/tag-booklists_tpl.html',
                resolve: {
                    booklists: function(booklistservice, $stateParams) {
                        return booklistservice.getBooklists(1, 'all', $stateParams.tag)
                    }
                }
            })
            .state('commentsBook',{
                url: '/comments/{isbn}',
                controller: 'CommentsCtrl as vm',
                templateUrl: 'comments/comments_tpl.html',
                resolve: {
                    comments: function(commentservice, $stateParams) {
                        return commentservice.getComment($stateParams.isbn)
                    }
                }
            })
            .state('tags',{
                url: '/tags',
                controller: 'TagsCtrl as vm',
                templateUrl: 'tags/tags_tpl.html',
                resolve: {
                    tags: function(tagservice) {
                        return tagservice.getAllTags()
                    }
                }
            })
            .state('orders',{
                url: '/orders/{status}/show',
                controller: 'OrdersCtrl as vm',
                templateUrl: 'orders/orders_tpl.html',
                resolve: {
                    orders: function(orderservice, $stateParams) {
                        return orderservice.getOrder($stateParams.status)
                            .then(response => {
                                for(let order of response) {
                                    order.status = statusDict[order.status];
                                }
                                return response;
                            });
                    }
                }
            })
            .state('orderDetail',{
                url: '/order/{id}/detail',
                controller: 'OrderDetailCtrl as vm',
                templateUrl: 'order_detail/order_detail_tpl.html',
                resolve: {
                    order: function(orderservice, $stateParams) {
                        return orderservice.getOrderDetail($stateParams.id)
                    }
                }
            })
            .state('ordersAfterSales', {
                url: '/aftersales/list',
                controller: 'OrdersAftersalesCtrl as vm',
                templateUrl: 'orders_aftersales/orders_aftersales_tpl.html',
                resolve: {
                    aftersales: function(orderservice) {
                        return orderservice.getAftersale()
                    }
                }
            })
            .state('aftersales', {
                url: '/aftersales',
                controller: 'OrderReturnCtrl as vm',
                templateUrl: 'order_return/order_return_tpl.html',
            })
            .state('ordersAftersalesDetail', {
                url: '/order/{orderid}/afterselling/{aftersellingid}',
                controller: 'OrdersAftersalesDetailCtrl as vm',
                templateUrl: 'orders_aftersales_detail/orders_aftersales_detail_tpl.html',
                resolve: {
                    aftersale: function(orderservice, $stateParams) {
                        return orderservice.getAferSaleDetail($stateParams.orderid, $stateParams.aftersellingid)
                    },
                    order: function(orderservice, $stateParams) {
                        return orderservice.getOrderDetail($stateParams.orderid)
                    }
                }
            })
            .state('orderComments',{
                url: '/order/{id}/comments',
                controller: 'OrderCommentsCtrl as vm',
                templateUrl: 'order_comments/order_comments_tpl.html',
                resolve: {
                    order: function(orderservice, $stateParams) {
                        return orderservice.getOrderDetail($stateParams.id)
                    }
                }
            })
            .state('comments',{
                url: '/comments',
                controller: 'UserCommentsCtrl as vm',
                templateUrl: 'user_comments/user_comments_tpl.html',
                resolve: {
                    comments: function(userservice) {
                        return userservice.getUserComments()
                    }
                }
            })
            .state('booklistsCollect',{
                url: '/collect',
                controller: 'CollectCtrl as vm',
                templateUrl: 'collect/collect_tpl.html',
                resolve: {
                    booklists: function(userservice) {
                        return userservice.getUserCollect('booklist')
                            .then(response => response);
                    },
                    books: function(userservice) {
                        return userservice.getUserCollect('book')
                            .then(response => {
                                for(let book of response) {
                                    book.star = Math.ceil(book.rate/2);
                                }
                                return response;
                            });
                    }
                }
            })
            .state('point', {
                url: '/point',
                controller: 'PointCtrl as vm',
                templateUrl: 'point/point_tpl.html',
                resolve: {
                    points: function(userservice) {
                        return userservice.getUserPoints()
                    }
                }
            })
            .state('notices',{
                url: '/notices',
                controller: 'NoticesCtrl as vm',
                templateUrl: 'notices/notices_tpl.html',
                resolve: {
                    notices: function(userservice) {
                        return userservice.getUserNotices()
                    }
                }
            })
            .state('settings', {
                url: '/settings',
                controller: 'SettingsCtrl as vm',
                templateUrl: 'settings/settings_tpl.html',
                resolve: {
                    user: function(userservice) {
                        return userservice.getUserInfo()
                    }
                }
            })
            .state('address', {
                url: '/setting/address',
                controller: 'AddressCtrl as vm',
                templateUrl: 'setting_address/setting_address_tpl.html',
                resolve: {
                    address: function(userservice) {
                        return userservice.getUserAddress()
                    }
                }
            })
            .state('AddressAdd', {
                url: '/setting/address/add',
                controller: 'AddressAddCtrl as vm',
                templateUrl: 'setting_address_add/setting_address_add_tpl.html',
            })
            .state('cart2order', {
                url: '/cart2order',
                controller: 'Cart2OrderCtrl as vm',
                templateUrl: 'cart2order/cart2order_tpl.html',
            })
            .state('suggest', {
                url: '/suggest',
                controller: 'SuggestCtrl as vm',
                templateUrl: 'suggest/suggest_tpl.html',
                resolve: {
                    user: function(userservice) {
                        return userservice.getUserInfo();
                    }
                }
            })
            .state('auth', {
                url: '/auth',
                templateUrl: 'auth/auth_tpl.html',
                controller: 'AuthCtrl as vm',
                resolve: {
                    user: function($q, $window) {
                        return $q((resolve, reject) => {
                            if($window.sessionStorage.getItem('token') !== undefined && $window.sessionStorage.getItem('token') !== 'undefined') {
                                reject();
                            } else {
                                resolve();
                            }
                        })
                    }
                }
            })
    }

})();
