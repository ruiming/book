(function(){
    'use strict';

    let bookRow = () => {
        return {
            restrict: 'EA',
            scope: {
                books: '=',
                more: '='
            },
            template:
            `
            <div class="books-content" infinite-scroll="more()">
                <a class="books-content-list" ng-repeat="book in books" ui-sref="book({isbn: book.isbn})">
                    <img ng-src="{{book.image}}">
                    <span class="title">{{book.title}}</span>
                    <uib-rating class="star red-star wechat-fix"
                                ng-model="book.star"
                                max="5" read-only="true"
                                state-on="'fa fa-star'" state-off="'fa fa-star-o'"></uib-rating>
                    <span class="rate">&nbsp;{{book.rate}}</span>
                    <blockquote class="reason" ng-bind-html="book.reason"></blockquote>
                </a>
            </div>
            `
        };
    };

    angular
        .module('index')
        .directive('bookRow', bookRow);

})();
