routeApp.controller('SettingsCtrl', function($http, $scope, UserMessage){

    // todo 设置页，需要gravatar, name, sex, cart, order{wait,received}, address[{name, phone, dorm, id}], signature
    $http({
        method: 'GET',
        url: host + '/user_info_detail'
    }).success(function(response){
        $scope.user = response;
        UserMessage.setSignature(response.signature);
        UserMessage.setAddress(response.address);
    });

});
