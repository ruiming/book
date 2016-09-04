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
            'angularPromiseButtons'
        ])
        .config(config)
        .run(function ($state, $rootScope, tokenInjector, $location, $window) {
            // localStroage should be removed in the production
            let token = $location.search().token || $window.localStorage.getItem('token');
            let userid = $location.search().user_id || $window.localStorage.getItem('userid');
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

            $rootScope.$on("$stateChangeSuccess", function (event, toState, toParams, fromState, fromParams) {
                $rootScope.loading = false;
            });

            $rootScope.$on("$stateChangeError", function (event, toState, toParams, fromState, fromParams, error) {
                $rootScope.loading = false;
            });
        });

    config.$inject = ['$stateProvider', '$locationProvider', '$httpProvider', '$urlRouterProvider', 'angularPromiseButtonsProvider'];
    function config($stateProvider, $locationProvider, $httpProvider, $urlRouterProvider, angularPromiseButtonsProvider) {
        $httpProvider.defaults.transformResponse.push(response => {
            if(response && response.status_id && notices[response.status_id] !== void 0) {
                notie.alert(1, notices[response.status_id], 0.3);
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
                        return bookservice.getPopularBooks(1)
                            .then(response => response);
                    }
                }
            })
            .state('cart',{
                url: '/cart',
                controller: 'CartCtrl',
                templateUrl: 'cart/cart_tpl.html',
                controllerAs: 'vm',
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
                controller: 'MeCtrl',
                templateUrl: 'me/me_tpl.html',
                controllerAs: 'vm',
                nav: true,
                resolve: {
                    me: function(userservice) {
                        return userservice.getUserInfo()
                            .then(response => response);
                    }
                }
            })
            .state('booklists',{
                url: '/booklists',
                controller: 'BooklistsCtrl',
                templateUrl: 'booklists/booklists_tpl.html',
                controllerAs: 'vm',
                nav: true,
                resolve: {
                    tags: function(tagservice) {
                        return tagservice.getHotTags()
                            .then(response => response);
                    },
                    booklists: function(booklistservice) {
                        return booklistservice.getBooklists(1, 'all')
                            .then(response => response);
                    }
                }
            })
            .state('recommend',{
                url: '/books/recommend',
                controller: 'RecommendMoreCtrl',
                templateUrl: 'recommend_more/recommend_more_tpl.html',
                controllerAs: 'vm',
                resolve: {
                    books: function(bookservice) {
                        return bookservice.getPopularBooks(1)
                            .then(response => response);
                    }
                }
            })
            .state('popular',{
                url: '/booklists/popular',
                controller: 'PopularMoreCtrl',
                templateUrl: 'popular_more/popular_more_tpl.html',
                controllerAs: 'vm',
                resolve: {
                    booklists: function(booklistservice) {
                        return booklistservice.getBooklists(1)
                            .then(response => response);
                    }
                }
            })
            .state('book',{
                url: '/book/{isbn}',
                controller: 'BookCtrl',
                templateUrl: 'book/book_tpl.html',
                controllerAs: 'vm',
                resolve: {
                    book: function(bookservice, $stateParams) {
                        return bookservice.getBook($stateParams.isbn)
                            .then(response => {
                                return response;
                            });
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
                url: '/booklist/{id}/{title}/comments',
                controller: 'BooklistCommentsCtrl',
                templateUrl: 'booklist_comments/booklist_comments_tpl.html',
                controllerAs: 'vm',
                resolve: {
                    title: function($stateParams) {
                        return $stateParams.title;
                    }
                }
            })
            .state('tagBooklists',{
                url: '/booklists/{tag}',
                controller: 'TagBooklistsCtrl',
                templateUrl: 'tag-booklists/tag-booklists_tpl.html',
                controllerAs: 'vm',
                resolve: {
                    booklists: function(booklistservice, $stateParams) {
                        return booklistservice.getBooklists(1, 'all', $stateParams.tag)
                            .then(response => response);
                    }
                }
            })
            .state('commentsBook',{
                url: '/comments/{isbn}',
                controller: 'CommentsCtrl',
                templateUrl: 'comments/comments_tpl.html',
                controllerAs: 'vm',
                resolve: {
                    comments: function(commentservice, $stateParams) {
                        return commentservice.getComment($stateParams.isbn)
                            .then(response => response);
                    }
                }
            })
            .state('tags',{
                url: '/tags',
                controller: 'TagsCtrl',
                templateUrl: 'tags/tags_tpl.html',
                controllerAs: 'vm',
                resolve: {
                    tags: function(tagservice) {
                        return tagservice.getAllTags()
                            .then(response => response);
                    }
                }
            })
            .state('orders',{
                url: '/orders/{status}/show',
                controller: 'OrdersCtrl',
                templateUrl: 'orders/orders_tpl.html',
                controllerAs: 'vm',
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
                controller: 'OrderDetailCtrl',
                templateUrl: 'order_detail/order_detail_tpl.html',
                controllerAs: 'vm',
                resolve: {
                    order: function(orderservice, $stateParams) {
                        return orderservice.getOrderDetail($stateParams.id)
                            .then(response => response);
                    }
                }
            })
            .state('ordersAfterSales', {
                url: '/aftersales/list',
                controller: 'OrdersAftersalesCtrl',
                templateUrl: 'orders_aftersales/orders_aftersales_tpl.html',
                controllerAs: 'vm',
                resolve: {
                    aftersales: function(orderservice) {
                        return orderservice.getAftersale()
                            .then(response => response);
                    }
                }
            })
            .state('aftersales', {
                url: '/aftersales',
                controller: 'OrderReturnCtrl',
                templateUrl: 'order_return/order_return_tpl.html',
                controllerAs: 'vm',
            })
            .state('orderComments',{
                url: '/order/{id}/comments',
                controller: 'OrderCommentsCtrl',
                templateUrl: 'order_comments/order_comments_tpl.html',
                controllerAs: 'vm',
                resolve: {
                    order: function(orderservice, $stateParams) {
                        return orderservice.getOrderDetail($stateParams.id)
                            .then(response => response);
                    }
                }
            })
            .state('comments',{
                url: '/comments',
                controller: 'UserCommentsCtrl',
                templateUrl: 'user_comments/user_comments_tpl.html',
                controllerAs: 'vm',
                resolve: {
                    comments: function(userservice) {
                        return userservice.getUserComments()
                            .then(response => {
                                console.log(response);
                                return response;
                            });
                    }
                }
            })
            .state('booklistsCollect',{
                url: '/collect',
                controller: 'CollectCtrl',
                templateUrl: 'collect/collect_tpl.html',
                controllerAs: 'vm',
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
                controller: 'PointCtrl',
                templateUrl: 'point/point_tpl.html',
                controllerAs: 'vm',
                resolve: {
                    points: function(userservice) {
                        return userservice.getUserPoints()
                            .then(response => response);
                    }
                }
            })
            .state('notices',{
                url: '/notices',
                controller: 'NoticesCtrl',
                templateUrl: 'notices/notices_tpl.html',
                controllerAs: 'vm',
                resolve: {
                    notices: function(userservice) {
                        return userservice.getUserNotices()
                            .then(response => response);
                    }
                }
            })
            .state('settings', {
                url: '/settings',
                controller: 'SettingsCtrl',
                templateUrl: 'settings/settings_tpl.html',
                controllerAs: 'vm',
                resolve: {
                    user: function(userservice) {
                        return userservice.getUserInfo()
                            .then(response => response);
                    }
                }
            })
            .state('address', {
                url: '/setting/address',
                controller: 'AddressCtrl',
                templateUrl: 'setting_address/setting_address_tpl.html',
                controllerAs: 'vm',
                resolve: {
                    address: function(userservice) {
                        return userservice.getUserAddress()
                            .then(response => response);
                    }
                }
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
                controllerAs: 'vm',
                resolve: {
                    user: function(userservice) {
                        return userservice.getUserInfo()
                            .then(response => response);
                    }
                }
            })
            .state('auth', {
                url: '/auth',
                templateUrl: 'auth/auth_tpl.html',
                abstract: true
            })
            .state('auth.register', {
                url: '/register',
                templateUrl: 'auth_register/auth_register_tpl.html',
                controller: 'AuthRegisterCtrl as vm'
            })
            .state('auth.login', {
                url: '/login',
                templateUrl: 'auth_login/auth_login_tpl.html',
                controller: 'AuthLoginCtrl as vm'
            })
    }

})();
