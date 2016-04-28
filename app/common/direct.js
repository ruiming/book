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
   }
});
routeApp.directive('loading', function(){
    return {
        restrict: 'AE',
        replace: true,
        template: '<div class="cssload-container"><div class="cssload-cord cssload-leftMove"><div class="cssload-ball"></div></div><div class="cssload-cord"<div class="cssload-ball"></div</div<div class="cssload-cord"> <div class="cssload-ball"></div> </div> <div class="cssload-cord"> <div class="cssload-ball"></div> </div> <div class="cssload-cord"> <div class="cssload-ball"></div> </div> <div class="cssload-cord"> <div class="cssload-ball"></div> </div> <div class="cssload-cord cssload-rightMove"> <div class="cssload-ball"></div> </div> <div class="cssload-shadows"> <div class="cssload-leftShadow"></div> <div></div> <div></div> <div></div> <div></div> <div></div> <div class="cssload-rightShadow"></div> </div>'
    }
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