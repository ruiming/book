var routeApp = angular.module('index',['ui.router','ui.bootstrap','ngAnimate','ngSanitize','ngTouch','infinite-scroll']);

routeApp.config(['$stateProvider','$locationProvider','$httpProvider', '$urlRouterProvider',function ($stateProvider,$locationProvider,$httpProvider,$urlRouterProvider) {

    // modify response from transformResponse and alert error
    $httpProvider.defaults.transformResponse.push(function (response) {
        if(typeof(response.data) != "undefined" && response.status == "success") {
            response = response.data;
            return response;
        }
        if(response.status == "error") {
            // todo change to alert when work
            console.log("----------------Error----------------: " + response.message);
            return;
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

