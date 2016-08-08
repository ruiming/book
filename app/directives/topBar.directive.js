(function() {
    'use strict';

    let topBar = () => {
        return {
            restrict: 'EA',
            replace: true,
            scope: {
                title: '=',
                icon: '='
            },
            template:
                `
            <div class="navbar navbar-default navbar-fixed-top topbar">
                <a class="navbar-brand"><i class="fa fa-book"></i>
                    {{title}}</a>
            </div>
            `
        };
    };

    angular
        .module('index')
        .directive('topBar', topBar);
})();
