(function(){
    'use strict';

    let commentStar = () => {
        return {
            restrict: 'EA',
            replace: true,
            scope: {
                stars: '=',
                title: '@'
            },
            template:
                `
                    <div>
                    <span>{{title}}</span>
                    <uib-rating ng-model="stars" max="5"
                                read-only="false"
                                class="red-star star" required
                                on-leave="overStar = null"
                                state-on="'fa fa-star'" state-off="'fa fa-star-o'">                         
                    </uib-rating>
                    </div>
                `
        };
    };

    angular
        .module('index')
        .directive('commentStar', commentStar);
})();