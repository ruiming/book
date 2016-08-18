(function() {
    'use strict';

    let booklistRow = () => {
        return {
            restrict: 'EA',
            scope: {
                booklists: '=',
                more: '='
            },
            template:
            `       
           <div class="booklists-row" infinite-scroll="more()">
                <a class="booklist" ng-repeat="booklist in booklists" ui-sref="booklist({id: booklist.id})">
                    <div class="pic">
                        <img ng-src="{{booklist.image}}">
                    </div>
                    <span class="title">{{booklist.title}}</span>
                    <span class="collect">{{booklist.collect}}人收藏</span>
                    <div class="tags">
                        <div class="tag" ng-repeat="tag in booklist.tags">
                            {{tag}}
                        </div>
                    </div>
                </a>
            </div>
            `
        };
    };

    angular
        .module('index')
        .directive('booklistRow', booklistRow);

})();