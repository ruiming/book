angular
    .module('index')
    .directive('loading', function(){
        return {
            restrict: 'AE',
            replace: true,
            template: `
                <div class="cssload-thecube">
                <div class="cssload-cube cssload-c1"></div>
                <div class="cssload-cube cssload-c2"></div>
                <div class="cssload-cube cssload-c4"></div>
                <div class="cssload-cube cssload-c3"></div>
                </div>
                `
        };
    });
