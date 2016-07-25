(function() {
    "use strict";

    let booklistRow = () => {
        return {
            restrict: 'EA',
            replace: true,
            scope: {
                booklists: '=',
                scroll: '='
            },
            template:
            `       
           <div class="booklists-row"  infinite-scroll='scroll.nextPage()' 
                infinite-scroll-disabled='scroll.busy'  infinite-scroll-distance='1'>
                <a class="booklist" ng-repeat="booklist in booklists" ui-sref="booklist({id: booklist.id})">
                    <img ng-src="{{booklist.image}}">
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
        }
    };

    angular
        .module('index')
        .directive('booklistRow', booklistRow);

})();