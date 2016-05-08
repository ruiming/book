routeApp.controller('OrderDetailCtrl',function($scope, $http, $stateParams){

    $scope.busy = true;

    // todo 获取订单详细信息
    $http({
        method: 'GET',
        url: host + '/orders',
        params: {
            id: $stateParams.id
        }
    }).success(function(response){
        $scope.order = response;
        $scope.busy = false;
    }).error(function(){
        $scope.order = {
                "create_time": "2015-04-02 14:52:32",
                "status": "待确认",
                "id": 199156345,
                "user": {
                    "avatar": "http://tp2.sinaimg.cn/2680544593/50/5725935006/1",
                    "username": "小白",
                    "id": "125124"
                },
                "process": [
                    {
                        "status": "待确认",
                        "time": "2015-04-02 14:52:32"
                    },
                    {
                        "status": "已确认",
                        "time": "2015-04-02 20:00:00"
                    },
                    {
                        "status": "已送达",
                        "time": "2015-04-03 12:12:00"
                    }
                ],
                "receipt": {
                    "name": "王思聪",
                    "id": 1005201,
                    "dorm": "华南师范大学石牌校区西三123",
                    "phone": "15521189653"
                },
                "price": 42,
                "method": "货到付款",
                "books": [
                    {
                        "title": "灯塔",
                        "image": "https://img1.doubanio.com/lpic/s28369978.jpg",
                        "author": [
                            "[法]克里斯多夫·夏布特（Christophe Chabouté）"
                        ],
                        "isbn": "9787550268388",
                        "price": 12,
                        "count": 2
                    },
                    {
                        "title": "灯塔",
                        "image": "https://img1.doubanio.com/lpic/s28369978.jpg",
                        "author": [
                            "[法]克里斯多夫·夏布特（Christophe Chabouté）"
                        ],
                        "isbn": "9787550268388",
                        "price": 12,
                        "count": 2
                    },
                    {
                        "title": "灯塔",
                        "image": "https://img1.doubanio.com/lpic/s28369978.jpg",
                        "author": [
                            "[法]克里斯多夫·夏布特（Christophe Chabouté）"
                        ],
                        "isbn": "9787550268388",
                        "price": 12,
                        "count": 2
                    }
                ]
            };
        $scope.busy = false;
    });

    // todo 确认收货
    $scope.receipt = function(order){
        $http({
            method: 'POST',
            url: host + '/order',
            data: {
                "id": order.id
            }
        }).success(function(){
            $scope.order.process.push({'status':'已收货','time': '2015-04-03 12:12:00'});
            $scope.order.status = "待评价";
            $scope.turn = 3;
        }).error(function(){
            $scope.order.process.push({'status':'已收货','time': '2015-04-03 12:12:00'});
            $scope.order.status = "待评价";
            $scope.turn = 3;
        });
    };
});
