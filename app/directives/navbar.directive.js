(function() {
    "use strict";

    let navbar = () => {
        return {
            restrict: 'AE',  //推荐使用A
            replace: true,   //template会覆盖掉自定义标签
            templateUrl: 'navbar/navbar_tpl.html'
        };
    };

    angular
        .module('index')
        .directive('navbar', navbar);
})();