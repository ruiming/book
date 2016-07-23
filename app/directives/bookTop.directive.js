(function(){
    "use strict";

    let bookTop = () => {
        return {
            restrict: 'EA',
            controllerAs: 'vm',
            template:
                `
                <div class="book-head">
                    <div class="book-image">
                        <img class="cover" ng-src="{{vm.book.image}}">
                        <img class="cover-bg" ng-src="{{v.book.image}}">
                    </div>
                    <div class="book-info">
                        <h3>{{vm.book.title}}</h3>
                        <div class="book-info-rate">
                            <uib-rating class="star wechat-fix" 
                                ng-model="vm.book.star" 
                                max="5" read-only="true" 
                                state-on="'fa fa-star'" state-off="'fa fa-star-o'"></uib-rating>
                            <span class="rate">{{vm.book.rate | number:1 }}</span>
                            <span class="collect">({{vm.book.commenters}}人评价)</span>
                            <a class="book-info-more-option" 
                                ui-sref="bookDetail({isbn: vm.book.isbn})" 
                                ng-click="vm.busy=true">
                                <i class="fa fa-chevron-right"></i>
                            </a>
                        </div>
                        <div class="book-info-basic">
                            <span class="author" ng-if='vm.book.author!=""'>
                                <span ng-repeat="x in vm.book.author">{{x}} </span>/
                            </span>
                            <span class="publisher" ng-if='vm.book.publisher!=""'>
                                {{book.publisher}} / 
                            </span>
                            <span class="publish_time" ng-if='vm.book.publish_time!=""'>
                                {{book.publish_time}}
                            </span>
                        </div>
                    </div>
                </div>      
                `
        }
    };

    angular
        .module('index')
        .directive('bookTop', bookTop);

})();