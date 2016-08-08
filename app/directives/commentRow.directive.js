(function(){
    'use strict';

    let commentRow = () => {
        return {
            restrict: 'EA',
            replace: true,
            scope: {
                comment: '=',
                up: '=',
                down: '='
            },
            template:
                `
                    <div class="comment">
                    <div class="origin">
                        <img ng-src="{{comment.user.avatar}}">
                        <span>{{comment.user.username}}</span>
                        <uib-rating class="star red-star"
                            ng-model="comment.star"
                            state-on="'fa fa-star'"
                            state-off="'fa fa-star-o'"
                            max="5" read-only="true"></uib-rating>
                    </div>
                    <p ng-bind-html="comment.content"></p>
                    <div class="comment-meta">
                            <p>{{comment.create_time*1000 | date:'yyyy-MM-dd HH:mm'}}</p>
                        <i class="fa"
                            ng-class={false:'fa-thumbs-o-down',true:'fa-thumbs-down'}[comment.down_already]
                            ng-click="down(comment)">
                            {{comment.down}}
                        </i>
                        <i class="fa"
                            ng-class={false:'fa-thumbs-o-up',true:'fa-thumbs-up'}[comment.up_already]
                            ng-click="up(comment)">
                            {{comment.up}}
                        </i>
                    </div>
                    </div>
                `
        };
    };

    angular
        .module('index')
        .directive('commentRow', commentRow);
})();