routeApp.directive('currentTime', function($timeout, dateFilter) {
// 实时显示指定规格化的时间
    return {
        scope: {
            format: '@',    // 规格化时间
            real: '@'       // 是否动态显示
        },
        link: function(scope, element){
            var timeoutId;

            function updateTime(){
                element.text(dateFilter(new Date(), scope.format));
            }

            if (scope.real == "true" || scope.real){
                function updateLater() {
                    timeoutId = $timeout(function () {
                        updateTime();
                        updateLater();
                    }, 1000);
                }

                element.bind('$destroy', function () {
                    $timeout.cancel(timeoutId);
                });

                updateLater();
            }

            else{
                updateTime();
            }
        }
    };
});
routeApp.directive('focusMe', function($timeout) {
    return {
        scope: { trigger: '@focusMe' },
        link: function(scope, element) {
            scope.$watch('trigger', function(value) {
                if(value === "true") {
                    $timeout(function() {
                        element[0].focus();
                    });
                }
            });
        }
    };
});
routeApp.directive('navbar', function(){
   return {
       restrict: 'AE',  //推荐使用A
       replace: true,   //template会覆盖掉自定义标签
       templateUrl: 'navbar/navbar_tpl.html'
   };
});
routeApp.directive('loading', function(){
    return {
        restrict: 'AE',
        replace: true,
        template: '<div class="cssload-thecube"><div class="cssload-cube cssload-c1"></div><div class="cssload-cube cssload-c2"></div><div class="cssload-cube cssload-c4"></div><div class="cssload-cube cssload-c3"></div></div>'
    };
});
routeApp.directive('wait', function(){
   return {
       restrict: 'AE',
       replace: true,
       template: '<div id="circularG"><div id="circularG_1" class="circularG"></div><div id="circularG_2" class="circularG"></div><div id="circularG_3" class="circularG"></div><div id="circularG_4" class="circularG"></div><div id="circularG_5" class="circularG"></div><div id="circularG_6" class="circularG"></div><div id="circularG_7" class="circularG"></div><div id="circularG_8" class="circularG"></div></div>'
   };
});
routeApp.directive('myMaxlength', function() {
    return {
        require: 'ngModel',
        link: function (scope, element, attrs, ngModelCtrl) {
            var maxlength = Number(attrs.myMaxlength);
            function fromUser(text) {
                if (text.length > maxlength) {
                    var transformedInput = text.substring(0, maxlength);
                    ngModelCtrl.$setViewValue(transformedInput);
                    ngModelCtrl.$render();
                    return transformedInput;
                }
                return text;
            }
            ngModelCtrl.$parsers.push(fromUser);
        }
    };
});