routeApp.controller('SettingsCtrl', function($http, $scope){

    $scope.user = JSON.parse(sessionStorage.user);

});
