(function(){
    'use strict';

    let bookSlide = () => {
        return {
            restrict: 'EA',
            replace: true,
            scope: {
                books: '=books'
            },
            template:
                `
             <div class="slides-book-content">
                <p>Test3: {{books === undefined}} {{books.length}}</p>
                <p></p>
                 <a ng-repeat="book in books track by $index" ui-sref="book({isbn: book.isbn})">
                    <img ng-src="{{book.image}}">
                    <p>{{book.title}}</p>
                    <uib-rating ng-model="book.star"
                                class="red-star wechat-fix"
                                state-on="'fa fa-star'"
                                state-off="'fa fa-star-o'"
                                max="5" 
                                read-only="true"></uib-rating>
                    <span>{{book.rate | number:1}}</span>
                </a>
            </div>
                `
        };
    };

    angular
        .module('index')
        .directive('bookSlide', bookSlide);

})();
