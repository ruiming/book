(function() {
    'use strict';

    angular
        .module('index')
        .directive('focusMe', focusMe);

    focusMe.$inject = ['$timeout'];
    function focusMe($timeout) {
        return {
            scope: { trigger: '@focusMe' },
            link: function(scope, element) {
                scope.$watch('trigger', function(value) {
                    if(value === 'true') {
                        $timeout(function() {
                            element[0].focus();
                        });
                    }
                });
            }
        };
    }
})();